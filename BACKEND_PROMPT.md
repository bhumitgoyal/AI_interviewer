# BACKEND PROMPT — AI Mock Interview Simulator

## Stack
- **Framework**: FastAPI (Python 3.11+)
- **LLM**: OpenAI GPT-4o via `openai` Python SDK
- **STT**: OpenAI Whisper API (`whisper-1`)
- **TTS**: OpenAI TTS API (`tts-1`, voice: `onyx`)
- **PDF Parsing**: `pdfplumber`
- **Session Store**: In-memory Python dict (keyed by `session_id` UUID)
- **Realtime**: WebSocket endpoint
- **CORS**: Allow all origins (dev)
- **Audio**: Return MP3 bytes as base64 in JSON

---

## Complete File Structure

```
backend/
├── main.py
├── models.py
├── interview_engine.py
├── pdf_parser.py
├── tts_service.py
├── requirements.txt
└── .env
```

---

## `requirements.txt`
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
openai==1.30.0
pdfplumber==0.11.0
python-multipart==0.0.9
python-dotenv==1.0.1
pydantic==2.7.1
websockets==12.0
aiofiles==23.2.1
```

---

## `.env`
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## `models.py`

```python
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class InterviewPhase(str, Enum):
    GREETING = "greeting"
    INTRODUCTION = "introduction"
    RESUME_DEEP_DIVE = "resume_deep_dive"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    DSA = "dsa"
    CLOSING = "closing"
    SUMMARY = "summary"

class Message(BaseModel):
    role: str  # "interviewer" or "candidate"
    content: str
    phase: Optional[InterviewPhase] = None

class SessionState(BaseModel):
    session_id: str
    resume_text: str
    job_description: str
    candidate_name: str = ""
    messages: List[Message] = []
    question_count: int = 0
    phase: InterviewPhase = InterviewPhase.GREETING
    hesitation_flags: List[dict] = []  # {"question": str, "answer": str, "reason": str}
    is_complete: bool = False

class StartSessionRequest(BaseModel):
    job_description: str

class CandidateAnswerRequest(BaseModel):
    session_id: str
    answer_text: str
    answer_duration_seconds: Optional[float] = None  # used to detect hesitation

class InterviewerResponsePayload(BaseModel):
    session_id: str
    interviewer_text: str
    audio_base64: str  # MP3 audio as base64
    phase: InterviewPhase
    question_number: int
    is_final: bool

class SummaryReport(BaseModel):
    session_id: str
    overall_score: int  # 0-100
    strengths: List[str]
    weaknesses: List[str]
    hesitation_moments: List[dict]
    better_answers: List[dict]  # {"question": str, "candidate_answer": str, "ideal_answer": str}
    technical_score: int
    communication_score: int
    confidence_score: int
    final_verdict: str
    detailed_feedback: str
```

---

## `pdf_parser.py`

```python
import pdfplumber
import io

def extract_resume_text(pdf_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
    full_text = "\n\n".join(text_parts)
    if not full_text.strip():
        raise ValueError("Could not extract text from PDF. Ensure it is not a scanned image.")
    return full_text
```

---

## `tts_service.py`

```python
import base64
from openai import AsyncOpenAI
import os

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def text_to_speech_base64(text: str, voice: str = "onyx") -> str:
    """Convert text to MP3 audio, return as base64 string."""
    response = await client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text,
        response_format="mp3"
    )
    audio_bytes = response.content
    return base64.b64encode(audio_bytes).decode("utf-8")
```

---

## `interview_engine.py`

```python
import os
import json
import uuid
from typing import Optional
from openai import AsyncOpenAI
from models import SessionState, Message, InterviewPhase, SummaryReport
from tts_service import text_to_speech_base64

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In-memory session store
sessions: dict[str, SessionState] = {}

SYSTEM_PROMPT_TEMPLATE = """You are an expert technical interviewer at a top-tier tech company. Your name is Alex.
You are conducting a real interview for the following job:

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

INTERVIEW RULES:
1. Be professional, warm but rigorous. Sound exactly like a real interviewer.
2. Ask ONE question at a time. Wait for the candidate to answer before the next question.
3. Follow this phase order strictly:
   - GREETING: Greet the candidate by name, introduce yourself as Alex, make them feel comfortable. (1-2 exchanges)
   - INTRODUCTION: Ask them to introduce themselves / walk you through their background. (1-2 exchanges)
   - RESUME_DEEP_DIVE: Drill into specific projects on their resume. Ask what THEY did, challenges they faced, decisions they made, results achieved. Ask about technologies listed. Be specific — name the project from their resume. (8-10 questions)
   - TECHNICAL: Ask technical questions relevant to the job description — architecture, system design, debugging, tools, frameworks. (5-7 questions)
   - DSA: If the job requires algorithms/data structures (check JD), ask 1-2 DSA problems. Ask them to walk through their logic step-by-step, not write code. (0-2 questions based on JD)
   - BEHAVIORAL: Ask 2-3 behavioral questions (STAR format expected). E.g., conflict resolution, leadership, failure story. (2-3 questions)
   - CLOSING: Thank them, ask if they have any questions for you, then close the interview professionally.
   - SUMMARY: Never shown to candidate — used internally for report generation.
4. Total questions: 20-30.
5. Keep your responses concise (1-3 sentences max per turn when asking a question).
6. Do NOT explain the phase or meta-commentary. Just speak naturally as Alex the interviewer.
7. If the candidate gives a vague answer, probe with "Can you elaborate?" or "What specifically was your role there?"
8. Detect hesitation: if the answer is very short (< 20 words) or says "I don't know / not sure", note it internally but continue gracefully.
9. NEVER break character. NEVER say you are an AI.

CURRENT PHASE: {current_phase}
QUESTIONS ASKED SO FAR: {question_count}

Respond ONLY with what Alex would say out loud. No stage directions. No formatting. Pure natural speech.
"""

def _build_openai_messages(state: SessionState) -> list:
    system_content = SYSTEM_PROMPT_TEMPLATE.format(
        job_description=state.job_description,
        resume_text=state.resume_text,
        current_phase=state.phase.value,
        question_count=state.question_count
    )
    messages = [{"role": "system", "content": system_content}]
    for msg in state.messages:
        role = "assistant" if msg.role == "interviewer" else "user"
        messages.append({"role": role, "content": msg.content})
    return messages

def _detect_hesitation(answer: str, question: str, duration: Optional[float]) -> Optional[dict]:
    word_count = len(answer.split())
    hesitation_phrases = [
        "i don't know", "i'm not sure", "hmm", "uh", "um",
        "i haven't", "i never", "i can't remember", "i forgot",
        "not really", "i guess", "maybe", "i think so"
    ]
    lower_answer = answer.lower()
    phrase_hit = any(p in lower_answer for p in hesitation_phrases)
    short_answer = word_count < 25
    slow_response = duration is not None and duration > 15.0

    if phrase_hit or (short_answer and slow_response):
        reason = []
        if phrase_hit:
            reason.append("used uncertainty phrases")
        if short_answer:
            reason.append(f"brief answer ({word_count} words)")
        if slow_response:
            reason.append(f"long pause ({duration:.0f}s)")
        return {"question": question, "answer": answer, "reason": ", ".join(reason)}
    return None

def _determine_phase(question_count: int, current_phase: InterviewPhase, job_description: str) -> InterviewPhase:
    needs_dsa = any(kw in job_description.lower() for kw in [
        "algorithm", "data structure", "leetcode", "competitive", "dsa", "coding interview",
        "software engineer", "swe", "backend engineer", "full stack"
    ])
    
    if current_phase == InterviewPhase.GREETING and question_count >= 2:
        return InterviewPhase.INTRODUCTION
    elif current_phase == InterviewPhase.INTRODUCTION and question_count >= 3:
        return InterviewPhase.RESUME_DEEP_DIVE
    elif current_phase == InterviewPhase.RESUME_DEEP_DIVE and question_count >= 13:
        return InterviewPhase.TECHNICAL
    elif current_phase == InterviewPhase.TECHNICAL and question_count >= 19:
        return InterviewPhase.DSA if needs_dsa else InterviewPhase.BEHAVIORAL
    elif current_phase == InterviewPhase.DSA and question_count >= 22:
        return InterviewPhase.BEHAVIORAL
    elif current_phase == InterviewPhase.BEHAVIORAL and question_count >= 25:
        return InterviewPhase.CLOSING
    elif current_phase == InterviewPhase.CLOSING and question_count >= 27:
        return InterviewPhase.SUMMARY
    return current_phase

async def create_session(resume_text: str, job_description: str) -> SessionState:
    session_id = str(uuid.uuid4())
    state = SessionState(
        session_id=session_id,
        resume_text=resume_text,
        job_description=job_description,
        phase=InterviewPhase.GREETING
    )
    sessions[session_id] = state
    return state

async def get_next_interviewer_message(
    session_id: str,
    candidate_answer: Optional[str] = None,
    answer_duration: Optional[float] = None
) -> dict:
    state = sessions.get(session_id)
    if not state:
        raise ValueError(f"Session {session_id} not found")

    # Add candidate answer to history
    if candidate_answer:
        last_question = ""
        for msg in reversed(state.messages):
            if msg.role == "interviewer":
                last_question = msg.content
                break
        
        hesitation = _detect_hesitation(candidate_answer, last_question, answer_duration)
        if hesitation:
            state.hesitation_flags.append(hesitation)
        
        state.messages.append(Message(
            role="candidate",
            content=candidate_answer,
            phase=state.phase
        ))
        state.question_count += 1
        state.phase = _determine_phase(state.question_count, state.phase, state.job_description)

    # Check if interview is complete
    is_final = state.phase == InterviewPhase.SUMMARY or state.question_count >= 30

    # Build messages and call GPT-4o
    openai_messages = _build_openai_messages(state)
    
    if is_final and state.phase != InterviewPhase.CLOSING:
        openai_messages[-1]["content"] if openai_messages else None
        closing_instruction = {
            "role": "system",
            "content": "Now conclude the interview professionally and warmly. Thank the candidate, tell them the team will be in touch, wish them well. Keep it to 3-4 sentences."
        }
        openai_messages.append(closing_instruction)

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=openai_messages,
        temperature=0.7,
        max_tokens=300
    )
    
    interviewer_text = response.choices[0].message.content.strip()
    
    # Add to history
    state.messages.append(Message(
        role="interviewer",
        content=interviewer_text,
        phase=state.phase
    ))

    # Extract candidate name from first message if greeting
    if state.phase == InterviewPhase.GREETING and not state.candidate_name:
        if candidate_answer:
            name_extraction = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{
                    "role": "user",
                    "content": f"Extract only the first name from this text. Reply with ONLY the name, nothing else: '{candidate_answer}'"
                }],
                max_tokens=10
            )
            state.candidate_name = name_extraction.choices[0].message.content.strip()

    # Generate TTS audio
    audio_base64 = await text_to_speech_base64(interviewer_text, voice="onyx")

    sessions[session_id] = state

    return {
        "session_id": session_id,
        "interviewer_text": interviewer_text,
        "audio_base64": audio_base64,
        "phase": state.phase.value,
        "question_number": state.question_count,
        "is_final": is_final,
        "candidate_name": state.candidate_name
    }

async def generate_summary_report(session_id: str) -> dict:
    state = sessions.get(session_id)
    if not state:
        raise ValueError(f"Session {session_id} not found")

    # Build full transcript
    transcript = "\n".join([
        f"{'INTERVIEWER' if m.role == 'interviewer' else 'CANDIDATE'}: {m.content}"
        for m in state.messages
    ])

    hesitation_json = json.dumps(state.hesitation_flags, indent=2)

    summary_prompt = f"""You are an expert hiring manager. Analyze this complete interview transcript and generate a detailed evaluation report.

INTERVIEW TRANSCRIPT:
{transcript}

HESITATION MOMENTS DETECTED:
{hesitation_json}

JOB DESCRIPTION:
{state.job_description}

CANDIDATE RESUME:
{state.resume_text}

Generate a JSON report with EXACTLY this structure (no extra fields, no markdown):
{{
  "overall_score": <integer 0-100>,
  "technical_score": <integer 0-100>,
  "communication_score": <integer 0-100>,
  "confidence_score": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "hesitation_moments": [
    {{"question": "<question text>", "answer": "<candidate answer>", "analysis": "<why this was weak>"}}
  ],
  "better_answers": [
    {{"question": "<question>", "candidate_answer": "<what they said>", "ideal_answer": "<what they should have said, 2-3 sentences>"}}
  ],
  "final_verdict": "<Hired / Strong Consider / Consider / Reject with 1-sentence reason>",
  "detailed_feedback": "<3-4 paragraph comprehensive feedback covering technical depth, communication style, areas to improve, specific advice>"
}}

Be brutally honest but constructive. Include 3-5 better_answers for questions where the candidate underperformed.
Respond ONLY with valid JSON. No markdown. No preamble."""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": summary_prompt}],
        temperature=0.3,
        max_tokens=2500,
        response_format={"type": "json_object"}
    )

    report_data = json.loads(response.choices[0].message.content)
    report_data["session_id"] = session_id
    report_data["candidate_name"] = state.candidate_name
    report_data["total_questions"] = state.question_count

    state.is_complete = True
    sessions[session_id] = state

    return report_data

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    import io
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = filename
    transcript = await client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="en"
    )
    return transcript.text.strip()
```

---

## `main.py`

```python
import os
import uuid
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from typing import Optional
import base64
import json

load_dotenv()

from models import CandidateAnswerRequest
from pdf_parser import extract_resume_text
from interview_engine import (
    create_session,
    get_next_interviewer_message,
    generate_summary_report,
    transcribe_audio,
    sessions
)

app = FastAPI(title="AI Mock Interview API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": time.time()}

@app.post("/api/session/start")
async def start_session(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    
    pdf_bytes = await resume.read()
    if len(pdf_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="PDF too large. Max 10MB.")
    
    try:
        resume_text = extract_resume_text(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    if not job_description.strip() or len(job_description) < 50:
        raise HTTPException(status_code=400, detail="Job description too short. Provide at least 50 characters.")
    
    state = await create_session(resume_text, job_description.strip())
    
    # Get first interviewer message (greeting)
    first_message = await get_next_interviewer_message(state.session_id)
    
    return JSONResponse(content={
        "session_id": state.session_id,
        "first_message": first_message
    })

@app.post("/api/interview/respond")
async def respond_to_interview(request: CandidateAnswerRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    
    if not request.answer_text.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")
    
    response = await get_next_interviewer_message(
        session_id=request.session_id,
        candidate_answer=request.answer_text.strip(),
        answer_duration=request.answer_duration_seconds
    )
    
    return JSONResponse(content=response)

@app.post("/api/interview/transcribe")
async def transcribe_candidate_audio(
    audio: UploadFile = File(...),
    session_id: str = Form(...)
):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio too large.")
    
    filename = audio.filename or "recording.webm"
    
    try:
        transcript = await transcribe_audio(audio_bytes, filename=filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    return JSONResponse(content={"transcript": transcript, "session_id": session_id})

@app.post("/api/interview/summary")
async def get_summary(body: dict):
    session_id = body.get("session_id")
    if not session_id or session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    try:
        report = await generate_summary_report(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")
    
    return JSONResponse(content=report)

@app.get("/api/session/{session_id}/status")
async def session_status(session_id: str):
    state = sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {
        "session_id": session_id,
        "phase": state.phase.value,
        "question_count": state.question_count,
        "is_complete": state.is_complete,
        "candidate_name": state.candidate_name
    }

@app.websocket("/ws/interview/{session_id}")
async def websocket_interview(websocket: WebSocket, session_id: str):
    """
    WebSocket for real-time audio streaming.
    Client sends: {"type": "audio_chunk", "data": "<base64 webm chunk>"}
               or {"type": "audio_end", "duration": 12.5}
    Server sends: {"type": "transcript", "text": "..."} 
               then {"type": "interviewer_response", ...full response payload...}
    """
    await websocket.accept()
    
    if session_id not in sessions:
        await websocket.send_json({"type": "error", "message": "Session not found"})
        await websocket.close()
        return
    
    audio_chunks = []
    
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "audio_chunk":
                chunk_b64 = data.get("data", "")
                if chunk_b64:
                    audio_chunks.append(base64.b64decode(chunk_b64))
            
            elif msg_type == "audio_end":
                duration = data.get("duration", None)
                
                if audio_chunks:
                    full_audio = b"".join(audio_chunks)
                    audio_chunks = []
                    
                    try:
                        transcript = await transcribe_audio(full_audio, "recording.webm")
                        await websocket.send_json({
                            "type": "transcript",
                            "text": transcript
                        })
                        
                        response = await get_next_interviewer_message(
                            session_id=session_id,
                            candidate_answer=transcript,
                            answer_duration=duration
                        )
                        await websocket.send_json({
                            "type": "interviewer_response",
                            **response
                        })
                        
                        if response.get("is_final"):
                            report = await generate_summary_report(session_id)
                            await websocket.send_json({
                                "type": "summary_ready",
                                "report": report
                            })
                    except Exception as e:
                        await websocket.send_json({"type": "error", "message": str(e)})
                else:
                    await websocket.send_json({"type": "error", "message": "No audio received"})
            
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## How to Run

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # add your OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

## API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session/start` | Upload PDF + JD, returns session_id + first message |
| POST | `/api/interview/respond` | Submit text answer, get next question |
| POST | `/api/interview/transcribe` | Upload audio blob, get transcript |
| POST | `/api/interview/summary` | Get full evaluation report |
| GET | `/api/session/{id}/status` | Check session phase/progress |
| WS | `/ws/interview/{id}` | Real-time audio streaming mode |
