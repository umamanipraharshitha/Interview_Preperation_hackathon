import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.models import get_db, Interview, ChatMessage as DbChatMessage, Evaluation, Resume
from core.security import get_current_user, TokenData
from google import genai
from google.genai import types

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

@router.post("/start")
async def start_interview(
    resume_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to start interview")

    # Get resume to make sure it exists
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    db_interview = Interview(candidate_id=1, resume_id=resume_id, status="in_progress")
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    # Initial AI message based on resume
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        prompt = "You are an expert technical interviewer. Start the interview by greeting the candidate and asking an introductory question based on their resume. Keep it brief. "
        if resume and resume.parsed_text:
            prompt += f"\nResume context:\n{resume.parsed_text[:1000]}"
            
        response = client.models.generate_content(
            model=os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash"),
            contents=prompt
        )
        ai_reply = response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        ai_reply = "Hello! I've reviewed your resume. Could you tell me a bit about your background?"

    first_msg = DbChatMessage(interview_id=db_interview.id, role="ai", content=ai_reply)
    db.add(first_msg)
    db.commit()

    return {"message": "Interview session started", "interview_id": db_interview.id, "initial_message": ai_reply}

@router.get("/{interview_id}/status")
async def get_interview_status(
    interview_id: int,
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return {"status": interview.status}

@router.get("/{interview_id}/messages")
async def get_interview_messages(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    messages = db.query(DbChatMessage).filter(DbChatMessage.interview_id == interview_id).order_by(DbChatMessage.timestamp.asc()).all()
    return {"messages": [{"role": m.role, "content": m.content} for m in messages]}

@router.post("/{interview_id}/chat")
async def chat_with_ai(
    interview_id: int,
    chat: ChatMessage,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    # Save user message
    user_msg = DbChatMessage(interview_id=interview_id, role="user", content=chat.message)
    db.add(user_msg)
    db.commit()

    # Get history
    history = db.query(DbChatMessage).filter(DbChatMessage.interview_id == interview_id).order_by(DbChatMessage.timestamp.asc()).all()
    
    contents = []
    for msg in history:
        contents.append(types.Content(
            role="user" if msg.role == "user" else "model",
            parts=[types.Part.from_text(text=msg.content)]
        ))
        
    system_instruction = "You are an expert technical interviewer. Ask exactly ONE concise follow-up question based on the candidate's response. Do NOT provide feedback yet."

    try:
        # Call Google Gemini
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model=os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash"),
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            )
        )
        ai_reply = response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        ai_reply = "I'm having trouble connecting to my brain right now. Can we try again?"
        
    # Save AI message
    ai_msg = DbChatMessage(interview_id=interview_id, role="ai", content=ai_reply)
    db.add(ai_msg)
    db.commit()
        
    return {"reply": ai_reply}

@router.post("/{interview_id}/evaluate")
async def evaluate_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.status = "completed"
    db.commit()

    history = db.query(DbChatMessage).filter(DbChatMessage.interview_id == interview_id).order_by(DbChatMessage.timestamp.asc()).all()
    
    transcript = ""
    for msg in history:
        role = "Candidate" if msg.role == "user" else "Interviewer"
        transcript += f"{role}: {msg.content}\n"
        
    prompt = f"Evaluate the following interview transcript. Provide a brief overall feedback paragraph, followed by specific suggestions for improvement. Finally, give an estimated technical score and communication score out of 100. \n\nTranscript:\n{transcript}"

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model=os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash"),
            contents=prompt
        )
        feedback = response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        feedback = "Error generating evaluation. Please try again later."
        
    evaluation = Evaluation(
        interview_id=interview_id,
        technical_score=0.0, # Placeholder, could parse from LLM
        communication_score=0.0,
        ats_score=0.0,
        feedback_text=feedback,
        blockchain_hash="pending"
    )
    db.add(evaluation)
    db.commit()
    
    return {"feedback": feedback}
