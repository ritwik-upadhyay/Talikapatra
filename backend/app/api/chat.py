from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
from backend.app.core.database import get_db
from backend.app.models.workspace import Workspace, Document, User
from backend.app.core.auth_utils import get_current_user
from backend.app.core.config import settings

router = APIRouter(prefix="/workspaces/{workspace_id}/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sources: List[str]

@router.post("", response_model=ChatResponse)
def chat_with_workspace(
    workspace_id: int,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify workspace exists and belongs to current user
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
        
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GEMINI_API_KEY is not set on the server. Please check the backend .env configuration."
        )

    # 1. Retrieve all document texts in this workspace
    documents = db.query(Document).filter(Document.workspace_id == workspace_id).all()
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="There are no documents in this workspace. Please run research or upload a document first before chatting."
        )

    # 2. Construct context from source documents
    # Leveraging Gemini's large context window (1M+ tokens) to send full source texts directly
    context_parts = []
    source_titles = []
    
    for doc in documents:
        doc_header = f"--- Document Title: {doc.title} ---"
        doc_text = doc.raw_text_content or "[No Text Content]"
        context_parts.append(f"{doc_header}\n{doc_text}\n")
        source_titles.append(doc.title)
        
    sources_context = "\n".join(context_parts)
    
    # 3. Configure Gemini Client
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3.1-flash-lite')
    
    system_instruction = (
        f"You are an AI Historical Research Assistant for the workspace '{workspace.title}'. "
        "Your goal is to help the researcher analyze and understand the uploaded/discovered source documents. "
        "Answer the user's questions based strictly on the provided documents. "
        "Cite the document titles inline (e.g., '[Title]') when referencing facts. "
        "If the answer cannot be found in the documents, state that you do not have enough information in your source files to answer."
    )
    
    prompt = (
        f"Workspace Documents Context:\n{sources_context}\n\n"
        f"User Question: {request.message}\n"
    )
    
    # Send request to Gemini
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3  # lower temperature for more factual historical grounding
            ),
            # Gemini supports passing system instruction directly to model
        )
        # Note: older google-generativeai SDKs might not support system_instruction directly in generate_content,
        # so we prepend the system instruction in the prompt context to ensure maximum compatibility.
        full_response_text = response.text
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini chat assistant encountered an error: {str(e)}"
        )
        
    return {
        "response": full_response_text,
        "sources": source_titles
    }
