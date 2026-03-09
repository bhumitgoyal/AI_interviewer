"""
Pydantic models for the AI Mock Interview Simulator.
Defines session state, request/response payloads, and interview phases.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class InterviewPhase(str, Enum):
    """Ordered phases of the mock interview."""
    GREETING = "greeting"
    INTRODUCTION = "introduction"
    RESUME_DEEP_DIVE = "resume_deep_dive"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    DSA = "dsa"
    CLOSING = "closing"
    SUMMARY = "summary"


class Message(BaseModel):
    """A single message in the interview conversation."""
    role: str  # "interviewer" or "candidate"
    content: str
    phase: Optional[InterviewPhase] = None
    timestamp: Optional[float] = None


class SessionState(BaseModel):
    """Full interview session state stored in memory."""
    session_id: str
    resume_text: str
    job_description: str
    candidate_name: str = ""
    messages: List[Message] = []
    question_count: int = 0
    phase_question_count: int = 0  # Questions answered in current phase
    phase: InterviewPhase = InterviewPhase.GREETING
    hesitation_flags: List[dict] = Field(default_factory=list)
    is_complete: bool = False
    created_at: float = 0.0  # Unix timestamp for session cleanup


class StartSessionRequest(BaseModel):
    """Request body for starting a new interview session."""
    job_description: str = Field(
        ...,
        min_length=50,
        description="The full job description for the target role."
    )


class CandidateAnswerRequest(BaseModel):
    """Request body for submitting a candidate's answer."""
    session_id: str = Field(..., description="The UUID of the active session.")
    answer_text: str = Field(..., min_length=1, description="The candidate's answer text.")
    answer_duration_seconds: Optional[float] = Field(
        None,
        description="Duration in seconds the candidate took to respond (used for hesitation detection)."
    )


class InterviewerResponsePayload(BaseModel):
    """Response payload containing the interviewer's next turn."""
    session_id: str
    interviewer_text: str
    audio_base64: str  # MP3 audio as base64
    phase: InterviewPhase
    question_number: int
    is_final: bool
    candidate_name: str = ""


class SummaryReport(BaseModel):
    """Full evaluation report generated at the end of the interview."""
    session_id: str
    candidate_name: str = ""
    total_questions: int = 0
    overall_score: int = Field(..., ge=0, le=100)
    strengths: List[str]
    weaknesses: List[str]
    hesitation_moments: List[dict]
    better_answers: List[dict]
    technical_score: int = Field(..., ge=0, le=100)
    communication_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    final_verdict: str
    detailed_feedback: str
