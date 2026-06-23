from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.workspace import Workspace
from backend.app.core.auth_utils import get_current_user
from backend.app.models.workspace import User
from backend.app.schemas.workspace import WorkspaceCreate, WorkspaceBriefResponse, WorkspaceDetailResponse, DocumentSchema, TimelineEventSchema, EntitySchema

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

@router.post("", response_model=WorkspaceBriefResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace = Workspace(
        title=workspace_in.title,
        description=workspace_in.description,
        user_id=current_user.id
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace

@router.get("", response_model=List[WorkspaceBriefResponse])
def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspaces = db.query(Workspace).filter(Workspace.user_id == current_user.id).all()
    return workspaces

@router.get("/{workspace_id}", response_model=WorkspaceDetailResponse)
def get_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    import json
    # Construct detail payload manually to match expected schema formatting
    return {
        "id": workspace.id,
        "title": workspace.title,
        "description": workspace.description,
        "search_intent": workspace.search_intent,
        "created_at": workspace.created_at,
        "documents": [
            {
                "id": d.id,
                "title": d.title,
                "source_url": d.source_url,
                "source_type": d.source_type,
                "source_confidence_score": d.source_confidence_score
            } for d in workspace.documents
        ],
        "timeline": [TimelineEventSchema.model_validate(t) for t in workspace.timeline_events],
        "entities": [
            {
                "id": e.id,
                "name": e.name,
                "type": e.type,
                "relevance_score": e.relevance_score
            } for e in workspace.entities
        ],
        "research_trails": [
            {
                "id": tr.id,
                "step_type": tr.step_type,
                "step_name": tr.step_name,
                "metadata": json.loads(tr.metadata_json) if tr.metadata_json else None,
                "timestamp": tr.timestamp
            } for tr in sorted(workspace.research_trails, key=lambda x: x.timestamp)
        ]
    }

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
        
    db.delete(workspace)
    db.commit()
    return None
