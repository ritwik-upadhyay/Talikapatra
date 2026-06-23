from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.workspace import Workspace, Document, User
from backend.app.core.auth_utils import get_current_user
from backend.app.core.pdf_utils import extract_text_from_pdf
from backend.app.schemas.workspace import DocumentSchema

router = APIRouter(prefix="/workspaces/{workspace_id}/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
async def upload_document(
    workspace_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify workspace exists and belongs to the current user
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    filename = file.filename
    content_type = file.content_type
    
    try:
        file_bytes = await file.read()
        
        if filename.endswith(".pdf") or content_type == "application/pdf":
            # Extract PDF text
            try:
                extracted_text = extract_text_from_pdf(file_bytes)
            except ValueError as ve:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=str(ve)
                )
        elif filename.endswith(".txt") or content_type == "text/plain":
            # Extract plain text
            try:
                extracted_text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="TXT file contains invalid UTF-8 characters."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only PDF and TXT files are supported in the MVP."
            )
            
        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Extracted document text content is empty."
            )
            
        # Create and save document in database
        document = Document(
            workspace_id=workspace_id,
            title=filename,
            source_url="Local Upload",
            raw_text_content=extracted_text
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during file upload processing: {str(e)}"
        )

@router.get("/{document_id}")
def get_document_content(
    workspace_id: int,
    document_id: int,
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
        
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.workspace_id == workspace_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    return {
        "id": document.id,
        "title": document.title,
        "raw_text_content": document.raw_text_content
    }
