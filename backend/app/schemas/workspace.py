from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class WorkspaceCreate(BaseModel):
    title: str
    description: Optional[str] = None

class DocumentSchema(BaseModel):
    id: int
    title: str
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    source_confidence_score: Optional[int] = None

    class Config:
        from_attributes = True

class TimelineEventSchema(BaseModel):
    id: int
    document_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    date_raw: Optional[str] = None
    date_iso: Optional[str] = None

    class Config:
        from_attributes = True

class EntitySchema(BaseModel):
    id: int
    name: str
    type: str
    relevance_score: Optional[int] = None

    class Config:
        from_attributes = True

class ResearchTrailSchema(BaseModel):
    id: int
    step_type: str
    step_name: str
    metadata: Optional[Any] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class WorkspaceDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    search_intent: Optional[str] = None
    created_at: datetime
    documents: List[DocumentSchema] = []
    timeline: List[TimelineEventSchema] = []
    entities: List[EntitySchema] = []
    research_trails: List[ResearchTrailSchema] = []

    class Config:
        from_attributes = True

class WorkspaceBriefResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

