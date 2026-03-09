"""
FastAPI application for the AI Mock Interview Simulator.

Provides REST API endpoints and WebSocket support for conducting
realistic mock interviews powered by OpenAI GPT-4o.
"""

import os
import time
import asyncio
import logging
import base64
import json
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables BEFORE importing modules that use them
# Only load .env if it exists (won't exist on Vercel where env vars are injected)
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

from models import CandidateAnswerRequest
from pdf_parser import extract_resume_text
from interview_engine import (
    create_session,
    get_next_interviewer_message,
    generate_summary_report,
    transcribe_audio,
    cleanup_stale_sessions,
    sessions,
)

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Background task: periodic session cleanup
# ---------------------------------------------------------------------------
async def _session_cleanup_loop():
    """Remove stale sessions every 30 minutes."""
    while True:
        await asyncio.sleep(1800)  # 30 minutes
        try:
            removed = cleanup_stale_sessions(max_age_seconds=7200)
            if removed:
                logger.info(f"Background cleanup removed {removed} stale session(s)")
        except Exception as e:
            logger.error(f"Session cleanup error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle manager."""
    logger.info("🚀 AI Mock Interview API starting up")
    cleanup_task = asyncio.create_task(_session_cleanup_loop())
    yield
    cleanup_task.cancel()
    logger.info("🛑 AI Mock Interview API shutting down")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Mock Interview API",
    description=(
        "A realistic AI-powered mock interview simulator. "
        "Upload your resume, provide a job description, and experience "
        "a full technical interview with real-time voice responses."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.0f}ms)"
    )
    return response


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": time.time(),
        "active_sessions": len(sessions),
    }


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------
@app.post("/api/session/start", tags=["Interview"])
async def start_session(
    resume: UploadFile = File(..., description="PDF resume file (max 10 MB)"),
    job_description: str = Form(
        ..., description="Full job description text (min 50 chars)"
    ),
):
    """
    Start a new interview session.

    Upload a PDF resume and provide the job description.
    Returns the session ID and the interviewer's first greeting message.
    """
    # Validate PDF
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await resume.read()
    if len(pdf_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="PDF too large. Max 10 MB.")

    # Extract resume text
    try:
        resume_text = extract_resume_text(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Validate job description
    if not job_description.strip() or len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description too short. Provide at least 50 characters.",
        )

    # Create session & get first message
    state = await create_session(resume_text, job_description.strip())
    first_message = await get_next_interviewer_message(state.session_id)

    logger.info(f"New session started: {state.session_id}")

    return JSONResponse(
        content={
            "session_id": state.session_id,
            "first_message": first_message,
        }
    )


# ---------------------------------------------------------------------------
# Interview interaction (text-based)
# ---------------------------------------------------------------------------
@app.post("/api/interview/respond", tags=["Interview"])
async def respond_to_interview(request: CandidateAnswerRequest):
    """
    Submit a text answer from the candidate.

    Returns the interviewer's next question with TTS audio (base64 MP3).
    """
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found or expired.")

    if not request.answer_text.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    try:
        response = await get_next_interviewer_message(
            session_id=request.session_id,
            candidate_answer=request.answer_text.strip(),
            answer_duration=request.answer_duration_seconds,
        )
    except Exception as e:
        logger.error(f"Interview respond error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

    return JSONResponse(content=response)


# ---------------------------------------------------------------------------
# Audio transcription
# ---------------------------------------------------------------------------
@app.post("/api/interview/transcribe", tags=["Interview"])
async def transcribe_candidate_audio(
    audio: UploadFile = File(..., description="Audio file (webm, mp3, wav, etc.)"),
    session_id: str = Form(..., description="Active session ID"),
):
    """
    Upload an audio recording from the candidate.

    Transcribes the audio using OpenAI Whisper and returns the transcript text.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file too large. Max 25 MB.")

    filename = audio.filename or "recording.webm"

    try:
        transcript = await transcribe_audio(audio_bytes, filename=filename)
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    return JSONResponse(content={"transcript": transcript, "session_id": session_id})


# ---------------------------------------------------------------------------
# Summary report
# ---------------------------------------------------------------------------
@app.post("/api/interview/summary", tags=["Interview"])
async def get_summary(body: dict):
    """
    Generate a full evaluation report for a completed interview.

    Returns scores, strengths, weaknesses, ideal answers, and detailed feedback.
    """
    session_id = body.get("session_id")
    if not session_id or session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        report = await generate_summary_report(session_id)
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Summary generation failed: {str(e)}"
        )

    return JSONResponse(content=report)


# ---------------------------------------------------------------------------
# Session status
# ---------------------------------------------------------------------------
@app.get("/api/session/{session_id}/status", tags=["Interview"])
async def session_status(session_id: str):
    """Check the current phase 	and progress of an interview session."""
    state = sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {
        "session_id": session_id,
        "phase": state.phase.value,
        "question_count": state.question_count,
        "is_complete": state.is_complete,
        "candidate_name": state.candidate_name,
    }


# ---------------------------------------------------------------------------
# WebSocket — real-time audio streaming
# ---------------------------------------------------------------------------
@app.websocket("/ws/interview/{session_id}")
async def websocket_interview(websocket: WebSocket, session_id: str):
    """
    WebSocket for real-time audio streaming during an interview.

    **Client sends:**
    - `{"type": "audio_chunk", "data": "<base64 webm chunk>"}`
    - `{"type": "audio_end", "duration": 12.5}`
    - `{"type": "text_answer", "text": "...", "duration": 10.0}`  ← text mode
    - `{"type": "ping"}`

    **Server sends:**
    - `{"type": "transcript", "text": "..."}`
    - `{"type": "interviewer_response", ...full response payload...}`
    - `{"type": "summary_ready", "report": {...}}`
    - `{"type": "pong"}`
    - `{"type": "error", "message": "..."}`
    """
    await websocket.accept()

    if session_id not in sessions:
        await websocket.send_json({"type": "error", "message": "Session not found"})
        await websocket.close()
        return

    logger.info(f"[{session_id[:8]}] WebSocket connected")
    audio_chunks: list[bytes] = []

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "audio_chunk":
                # Accumulate audio chunks
                chunk_b64 = data.get("data", "")
                if chunk_b64:
                    audio_chunks.append(base64.b64decode(chunk_b64))

            elif msg_type == "audio_end":
                # Process accumulated audio
                duration = data.get("duration", None)

                if audio_chunks:
                    full_audio = b"".join(audio_chunks)
                    audio_chunks = []

                    try:
                        # Transcribe
                        transcript = await transcribe_audio(full_audio, "recording.webm")
                        await websocket.send_json(
                            {"type": "transcript", "text": transcript}
                        )

                        # Get interviewer response
                        response = await get_next_interviewer_message(
                            session_id=session_id,
                            candidate_answer=transcript,
                            answer_duration=duration,
                        )
                        await websocket.send_json(
                            {"type": "interviewer_response", **response}
                        )

                        # Auto-generate summary if interview is done
                        if response.get("is_final"):
                            report = await generate_summary_report(session_id)
                            await websocket.send_json(
                                {"type": "summary_ready", "report": report}
                            )
                    except Exception as e:
                        logger.error(f"[{session_id[:8]}] WS audio processing error: {e}")
                        await websocket.send_json(
                            {"type": "error", "message": str(e)}
                        )
                else:
                    await websocket.send_json(
                        {"type": "error", "message": "No audio received"}
                    )

            elif msg_type == "text_answer":
                # Direct text mode (no audio)
                text = data.get("text", "").strip()
                duration = data.get("duration", None)

                if not text:
                    await websocket.send_json(
                        {"type": "error", "message": "Empty text answer"}
                    )
                    continue

                try:
                    response = await get_next_interviewer_message(
                        session_id=session_id,
                        candidate_answer=text,
                        answer_duration=duration,
                    )
                    await websocket.send_json(
                        {"type": "interviewer_response", **response}
                    )

                    if response.get("is_final"):
                        report = await generate_summary_report(session_id)
                        await websocket.send_json(
                            {"type": "summary_ready", "report": report}
                        )
                except Exception as e:
                    logger.error(f"[{session_id[:8]}] WS text processing error: {e}")
                    await websocket.send_json(
                        {"type": "error", "message": str(e)}
                    )

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info(f"[{session_id[:8]}] WebSocket disconnected")
    except Exception as e:
        logger.error(f"[{session_id[:8]}] WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
