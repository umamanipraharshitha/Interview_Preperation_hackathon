from .celery_app import celery_app
from database.models import SessionLocal, Resume, Evaluation, Interview
from database.qdrant_client import store_embedding
import time
from google import genai
import os

@celery_app.task(bind=True, max_retries=3)
def process_resume_task(self, resume_id: int, file_location: str, interview_id: int):
    print(f"Worker processing resume {resume_id} from {file_location}")
    db = SessionLocal()
    try:
        # 1. Parse text from file (Mocked for now since parsing PDFs requires PyPDF2)
        parsed_text = "Experienced software engineer with a strong background in Python and backend systems."
        
        # 2. Call Gemini AI Evaluation Engine (Mocked)
        print("Calling Gemini API...")
        time.sleep(2) # simulate API call
        ats_score = 90.0
        
        # 3. Generate Vector Embeddings (Mocked)
        embedding = [0.1] * 768
        
        # 4. Store in Qdrant
        store_embedding(resume_id, embedding, {"text": parsed_text})

        # 5. Update Database
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            resume.parsed_text = parsed_text
            
            # 6. GSheets CRM Sync (Mocked)
            print("Syncing score to Google Sheets...")
            
            # 7. Automated Email
            if ats_score >= 85:
                print("Sending automated selection email...")
                
            db.commit()

        # MARK INTERVIEW AS READY
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if interview:
            interview.status = "ready"
            db.commit()

        return {"status": "success", "ats_score": ats_score}

    except Exception as exc:
        db.rollback()
        print(f"Error processing resume: {exc}")
        self.retry(exc=exc, countdown=10) # Exponential backoff in real implementation
    finally:
        db.close()

@celery_app.task
def record_evaluation_blockchain(evaluation_id: int):
    print(f"Logging evaluation {evaluation_id} to Blockchain smart contract...")
    # Smart contract integration using Web3 goes here
    return True
