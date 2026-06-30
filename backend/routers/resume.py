import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from database.models import get_db, Resume, User, Interview
from core.security import get_current_user, TokenData
from workers.tasks import process_resume_task

router = APIRouter()

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only allow candidates (or admins for testing)
    if current_user.role not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to upload resume")
    
    # Save file
    os.makedirs("temp_storage", exist_ok=True)
    file_location = f"temp_storage/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    # Since we are testing with admin, fallback candidate_id to 1 if not found
    db_user = db.query(User).filter(User.username == current_user.username).first()
    candidate_id = db_user.id if db_user else 1

    # Create Resume DB entry
    db_resume = Resume(candidate_id=candidate_id, file_path=file_location, parsed_text="")
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Automatically create the pending Interview session
    db_interview = Interview(candidate_id=candidate_id, resume_id=db_resume.id, status="pending")
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    # Dispatch background task via Celery
    # We pass the interview ID as well so the worker can mark it ready
    process_resume_task.delay(db_resume.id, file_location, db_interview.id)

    return {
        "message": "Resume uploaded successfully. Processing in background.", 
        "resume_id": db_resume.id,
        "interview_id": db_interview.id
    }
