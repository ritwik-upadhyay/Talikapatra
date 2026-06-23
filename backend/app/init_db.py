from backend.app.core.database import engine, Base
# Import models to ensure they are registered on the Base metadata before creation
from backend.app.models.workspace import User, Workspace, Document, TimelineEvent, Entity, ResearchTrail

def init_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()
