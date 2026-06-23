from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from backend.app.core.config import settings
from backend.app.api import auth, workspaces, documents, research, chat

app = FastAPI(
    title="Talikapatra MVP API",
    description="Minimal Viable Product API for the AI-Powered Historical Research Engine",
    version="1.0.0"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(documents.router)
app.include_router(research.router)
app.include_router(chat.router)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "project": "Talikapatra MVP"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
