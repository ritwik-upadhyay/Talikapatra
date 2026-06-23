import logging
import traceback
import sys
import json
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import asyncio
from starlette.concurrency import run_in_threadpool
from backend.app.core.database import get_db
from backend.app.models.workspace import Workspace, Document, TimelineEvent, Entity, User, ResearchTrail
from backend.app.core.auth_utils import get_current_user
from backend.app.agents.discovery import search_wikipedia_metadata, fetch_wikipedia_content
from backend.app.agents.classifier import classify_and_rank
from backend.app.agents.extractor import run_extraction
from backend.app.agents.expansion import select_expansion_candidates
from backend.app.agents.compiler import compile_research_corpus
from backend.app.agents.debate_synthesizer import synthesize_research
from backend.app.core.config import settings

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/workspaces/{workspace_id}/research", tags=["research"])

class ResearchRequest(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    status: str
    events_extracted: int
    entities_extracted: int
    source_title: str

def log_trail(db: Session, workspace_id: int, step_type: str, step_name: str, metadata: dict = None):
    """
    Helper function to persist research trail records into the database.
    """
    try:
        metadata_json = json.dumps(metadata) if metadata else None
        trail = ResearchTrail(
            workspace_id=workspace_id,
            step_type=step_type,
            step_name=step_name,
            metadata_json=metadata_json
        )
        db.add(trail)
        db.commit()
        db.refresh(trail)
        logger.info(f"[Research Trail] Logged: '{step_name}' ({step_type}) for workspace_id={workspace_id}")
    except Exception as e:
        logger.error(f"Failed to write research trail log: {str(e)}")
        db.rollback()

def run_extraction_logged(title: str, text: str, api_key: str):
    """
    Threadpool wrapper for extraction and source confidence evaluation.
    """
    logger.info(f"[Research Pipeline] [Extraction] Starting extraction & evaluation for '{title}' (length: {len(text)} chars)")
    start_time = time.time()
    try:
        result = run_extraction(text, api_key)
        duration = time.time() - start_time
        logger.info(f"[Research Pipeline] [Extraction] Finished extraction/evaluation for '{title}' in {duration:.2f}s.")
        return result
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"[Research Pipeline] [Extraction] ERROR during extraction for '{title}' after {duration:.2f}s:")
        logger.error(traceback.format_exc())
        return e

@router.post("", response_model=ResearchResponse, status_code=status.HTTP_201_CREATED)
async def run_research_pipeline(
    workspace_id: int,
    request: ResearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"[Research Pipeline] Received request: workspace_id={workspace_id}, query='{request.query}', user={current_user.email}")
    
    # Verify workspace exists and belongs to current user
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        logger.warning(f"[Research Pipeline] Workspace {workspace_id} not found or doesn't belong to user {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
        
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.error(f"[Research Pipeline] GEMINI_API_KEY is not configured.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GEMINI_API_KEY is not set on the server. Please check the backend .env configuration."
        )

    # Begin Research Trail
    log_trail(db, workspace_id, "start", "Research Query Initiated", {"query": request.query})

    # 1. Broad Search: Query top 10 articles (metadata only)
    logger.info(f"[Research Pipeline] [Broad Search] Querying Wikipedia for: '{request.query}'...")
    try:
        candidates = await search_wikipedia_metadata(request.query, limit=10)
    except Exception as e:
        logger.error(f"[Research Pipeline] [Broad Search] Wikipedia search failed:")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Wikipedia broad search failed: {str(e)}"
        )
        
    if not candidates:
        logger.warning(f"[Research Pipeline] [Broad Search] No candidates found for '{request.query}'")
        log_trail(db, workspace_id, "broad_search_failed", "No Sources Found", {"query": request.query})
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No relevant historical documents found for search term: '{request.query}'."
        )
        
    log_trail(
        db, workspace_id, "broad_search", "Broad Search Completed", 
        {"candidates": [{"title": c["title"], "pageid": c["pageid"]} for c in candidates]}
    )

    # 2. Intent Classification & Relevance Ranking (Call 1)
    logger.info(f"[Research Pipeline] [Ranking] Calling Classification & Ranking Agent...")
    try:
        ranking_result = await run_in_threadpool(classify_and_rank, request.query, candidates, api_key)
        # Persist Intent to Workspace
        workspace.search_intent = ranking_result.search_intent
        db.commit()
    except Exception as e:
        logger.error(f"[Research Pipeline] [Ranking] Intent/Ranking call failed:")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Classification/Ranking Agent failed: {str(e)}"
        )

    # Filter out top candidates (limit to top 3 for optimal budget)
    # We sort candidate results and pick the top 3 scored >= 40
    ranked_candidates = sorted(ranking_result.ranked_articles, key=lambda x: x.relevance_score, reverse=True)
    selected_metadata = [rc for rc in ranked_candidates if rc.relevance_score >= 40][:3]
    
    # In case none are >= 40, just take the top 1 to guarantee at least one primary source
    if not selected_metadata and ranked_candidates:
        selected_metadata = [ranked_candidates[0]]

    selected_titles = [sm.title for sm in selected_metadata]
    logger.info(f"[Research Pipeline] [Ranking] Selected primary sources: {selected_titles}")
    
    log_trail(
        db, workspace_id, "intent_ranking", "Intent Classified & Sources Ranked",
        {
            "search_intent": ranking_result.search_intent,
            "selected_sources": [{"title": sm.title, "score": sm.relevance_score} for sm in selected_metadata]
        }
    )

    # 3. Primary Retrieval: Fetch Full Content for selected sources in parallel
    logger.info(f"[Research Pipeline] [Primary Retrieval] Downloading selected articles...")
    selected_page_info = []
    for sm in selected_metadata:
        orig = next((c for c in candidates if c["title"] == sm.title), None)
        if orig:
            selected_page_info.append(orig)
            
    retrieval_tasks = [
        fetch_wikipedia_content(info["title"], info["pageid"])
        for info in selected_page_info
    ]
    primary_contents = await asyncio.gather(*retrieval_tasks)
    
    primary_docs_to_harvest = []
    for idx, content in enumerate(primary_contents):
        info = selected_page_info[idx]
        score_meta = next((sm for sm in selected_metadata if sm.title == info["title"]), None)
        score = score_meta.relevance_score if score_meta else 50
        if content:
            primary_docs_to_harvest.append({
                "title": info["title"],
                "url": info["url"],
                "content": content,
                "score": score
            })
            
    log_trail(
        db, workspace_id, "primary_retrieval", "Primary Documents Downloaded",
        {"retrieved_titles": [d["title"] for d in primary_docs_to_harvest]}
    )

    # 4. Entity Harvesting & Evaluation (Calls 2–4)
    logger.info(f"[Research Pipeline] [Extraction] Running parallel Entity Harvesting & Evaluation...")
    extraction_tasks = [
        run_in_threadpool(run_extraction_logged, doc["title"], doc["content"], api_key)
        for doc in primary_docs_to_harvest
    ]
    extractions = await asyncio.gather(*extraction_tasks, return_exceptions=True)
    logger.info(f"[Research Pipeline] [Extraction] Parallel gather completed. Returned count: {len(extractions)}")

    total_events_created = 0
    total_entities_created = 0
    harvested_entities_list = []
    source_titles = []

    # Write primary documents and extractions to DB sequentially
    for i, p_doc in enumerate(primary_docs_to_harvest):
        title = p_doc["title"]
        source_titles.append(title)
        
        # Save Document to Database
        try:
            document = Document(
                workspace_id=workspace_id,
                title=title,
                source_url=p_doc["url"],
                raw_text_content=p_doc["content"],
                source_type="primary_context",
                source_confidence_score=p_doc["score"] # default ranker score
            )
            db.add(document)
            db.commit()
            db.refresh(document)
            logger.info(f"[Research Pipeline] [DB Write] Saved Primary Document '{title}' with ID: {document.id}")
        except Exception as e:
            logger.error(f"[Research Pipeline] [DB Write] Failed to write Document '{title}': {str(e)}")
            db.rollback()
            continue

        extraction = extractions[i]
        if isinstance(extraction, Exception):
            logger.error(f"[Research Pipeline] Extraction failed for '{title}': {str(extraction)}")
            continue

        # Update Document's usefulness score & rationale from Gemini evaluation
        try:
            document.source_confidence_score = extraction.source_confidence_score
            db.commit()
            logger.info(f"[Research Pipeline] [DB Write] Updated usefulness score to {extraction.source_confidence_score} for '{title}'")
        except Exception:
            db.rollback()

        # Save extracted Timeline Events
        try:
            for event in extraction.events:
                db_event = TimelineEvent(
                    workspace_id=workspace_id,
                    document_id=document.id,
                    title=event.title,
                    description=event.description,
                    date_raw=event.date_raw,
                    date_iso=event.date_iso
                )
                db.add(db_event)
                total_events_created += 1
            db.commit()
        except Exception as e:
            logger.error(f"[Research Pipeline] Failed to write events for '{title}': {str(e)}")
            db.rollback()

        # Save extracted Entities (avoid duplicates in same workspace)
        try:
            for entity in extraction.entities:
                harvested_entities_list.append({
                    "name": entity.name,
                    "type": entity.type,
                    "relevance_score": entity.relevance_score
                })
                
                existing_entity = db.query(Entity).filter(
                    Entity.workspace_id == workspace_id,
                    Entity.name == entity.name,
                    Entity.type == entity.type
                ).first()
                
                if not existing_entity:
                    db_entity = Entity(
                        workspace_id=workspace_id,
                        name=entity.name,
                        type=entity.type,
                        relevance_score=entity.relevance_score
                    )
                    db.add(db_entity)
                    total_entities_created += 1
            db.commit()
        except Exception as e:
            logger.error(f"[Research Pipeline] Failed to write entities for '{title}': {str(e)}")
            db.rollback()

    log_trail(
        db, workspace_id, "harvesting", "Entity Harvesting Completed",
        {"events_created": total_events_created, "entities_created": total_entities_created}
    )

    # 5. Programmatic Entity Expansion
    logger.info(f"[Research Pipeline] [Expansion] Running programmatic entity expansion selection...")
    expansion_names = select_expansion_candidates(harvested_entities_list, limit=3)
    logger.info(f"[Research Pipeline] [Expansion] Identified expansion entities: {expansion_names}")
    
    expanded_doc_titles = []
    
    if expansion_names:
        log_trail(db, workspace_id, "expansion_selection", "Expansion Entities Selected", {"entities": expansion_names})
        
        # Search & Fetch content for expanded entities in parallel
        async def process_expansion_entity(entity_name: str):
            try:
                # Query Wikipedia Search for the specific entity name
                search_res = await search_wikipedia_metadata(entity_name, limit=1)
                if not search_res:
                    return None
                first_match = search_res[0]
                
                # Fetch full content
                full_text = await fetch_wikipedia_content(first_match["title"], first_match["pageid"])
                if full_text:
                    return {
                        "title": first_match["title"],
                        "url": first_match["url"],
                        "content": full_text
                    }
            except Exception as ex:
                logger.error(f"Error expanding entity '{entity_name}': {str(ex)}")
            return None

        expansion_tasks = [process_expansion_entity(name) for name in expansion_names]
        expanded_docs = await asyncio.gather(*expansion_tasks)
        
        # Write expanded documents to DB sequentially
        for exp_doc in expanded_docs:
            if exp_doc:
                try:
                    # Avoid duplicates
                    exists = db.query(Document).filter(
                        Document.workspace_id == workspace_id,
                        Document.title == exp_doc["title"]
                    ).first()
                    
                    if not exists:
                        document = Document(
                            workspace_id=workspace_id,
                            title=exp_doc["title"],
                            source_url=exp_doc["url"],
                            raw_text_content=exp_doc["content"],
                            source_type="expanded_context",
                            source_confidence_score=70  # standard score for connected context
                        )
                        db.add(document)
                        db.commit()
                        db.refresh(document)
                        expanded_doc_titles.append(exp_doc["title"])
                        source_titles.append(exp_doc["title"])
                except Exception as e:
                    logger.error(f"Failed to save expanded doc '{exp_doc['title']}': {str(e)}")
                    db.rollback()

        log_trail(
            db, workspace_id, "expansion_retrieval", "Expanded Context Retracted",
            {"retrieved_titles": expanded_doc_titles}
        )
    else:
        logger.info("[Research Pipeline] No valid expansion candidates found. Skipping expansion pass.")
        log_trail(db, workspace_id, "expansion_skipped", "Expansion Skipped (No candidates)", {})

    # 6. Context Compilation
    logger.info(f"[Research Pipeline] [Compiler] Compiling research corpus...")
    # Load all documents stored in this workspace
    all_workspace_docs = db.query(Document).filter(Document.workspace_id == workspace_id).all()
    compiled_corpus = compile_research_corpus(all_workspace_docs)
    
    log_trail(
        db, workspace_id, "context_compilation", "Context Compiled",
        {"total_sources": len(all_workspace_docs)}
    )

    # 7. Debate Detection & Research Synthesis (Call 5)
    logger.info(f"[Research Pipeline] [Synthesis] Starting Debate Detection & Synthesis...")
    try:
        synthesis_result = await run_in_threadpool(synthesize_research, request.query, compiled_corpus, api_key)
        
        # Save synthesis markdown as a workspace document
        synthesis_title = f"Historical Research Synthesis: {request.query}"
        synthesis_doc = Document(
            workspace_id=workspace_id,
            title=synthesis_title,
            raw_text_content=synthesis_result.synthesis_markdown,
            source_type="user_upload", # saved as synthesis report
            source_confidence_score=100
        )
        db.add(synthesis_doc)
        db.commit()
        db.refresh(synthesis_doc)
        source_titles.append(synthesis_title)
        logger.info(f"[Research Pipeline] Saved final synthesis document with ID: {synthesis_doc.id}")
    except Exception as e:
        logger.error(f"[Research Pipeline] Debate detection/Synthesis call failed:")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Synthesis Agent failed: {str(e)}"
        )

    log_trail(
        db, workspace_id, "synthesis", "Research Synthesis Completed",
        {
            "debate_detected": synthesis_result.debate_detected,
            "confidence_score": synthesis_result.confidence_score,
            "reason": synthesis_result.reason,
            "document_id": synthesis_doc.id
        }
    )

    logger.info(f"[Research Pipeline] Pipeline run successful! Extracted {total_events_created} events, {total_entities_created} entities.")
    return {
        "status": "completed",
        "events_extracted": total_events_created,
        "entities_extracted": total_entities_created,
        "source_title": ", ".join(source_titles)
    }
