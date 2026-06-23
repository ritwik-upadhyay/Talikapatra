from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

import ssl

db_url = settings.DATABASE_URL
connect_args = {}

# Automatically normalize Postgres URL and use the pure-Python pg8000 driver
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

if db_url.startswith("postgresql+pg8000"):
    # Strip query parameters like sslmode to prevent pg8000 TypeError
    if "?" in db_url:
        db_url = db_url.split("?")[0]
    # Pass SSL context to pg8000 for encrypted connection (e.g. Neon)
    connect_args = {"ssl_context": ssl.create_default_context()}
elif db_url.startswith("sqlite"):
    # For SQLite, check_same_thread is set to False to support multi-threaded FastAPI async requests
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
