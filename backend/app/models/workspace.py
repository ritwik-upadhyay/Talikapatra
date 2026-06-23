from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    search_intent = Column(String, nullable=True)  # "Person Research", "Historical Debate", etc.
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="workspaces")
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="workspace", cascade="all, delete-orphan")
    entities = relationship("Entity", back_populates="workspace", cascade="all, delete-orphan")
    research_trails = relationship("ResearchTrail", back_populates="workspace", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    title = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    raw_text_content = Column(Text, nullable=True)
    source_type = Column(String, default="primary_context", nullable=True)  # "primary_context", "expanded_context", "user_upload"
    source_confidence_score = Column(Integer, default=50, nullable=True)  # 0-100 score of historical usefulness

    # Relationships
    workspace = relationship("Workspace", back_populates="documents")
    timeline_events = relationship("TimelineEvent", back_populates="document", cascade="all, delete-orphan")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date_raw = Column(String, nullable=True)  # raw text representation (e.g. 1556 CE)
    date_iso = Column(String, nullable=True)  # standard ISO string or year range representation

    # Relationships
    workspace = relationship("Workspace", back_populates="timeline_events")
    document = relationship("Document", back_populates="timeline_events")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # "Person", "Place", "Dynasty", "Organization", "Historical Text", etc.
    relevance_score = Column(Integer, default=50, nullable=True)  # 0-100 importance score

    # Relationships
    workspace = relationship("Workspace", back_populates="entities")

class ResearchTrail(Base):
    __tablename__ = "research_trails"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    step_type = Column(String, nullable=False)  # e.g., "intent_classification", "ranking", etc.
    step_name = Column(String, nullable=False)  # e.g., "Search Intent Classification"
    metadata_json = Column(Text, nullable=True)  # JSON metadata string
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    workspace = relationship("Workspace", back_populates="research_trails")
