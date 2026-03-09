"""
Core interview engine for the AI Mock Interview Simulator.

Manages session state, phase transitions, hesitation detection,
GPT-4o integration for interviewer responses, and summary report generation.
"""

import os
import io
import json
import time
import uuid
import logging
from typing import Optional
from openai import AsyncOpenAI
from models import SessionState, Message, InterviewPhase, SummaryReport
from tts_service import text_to_speech_base64

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------------------------------------------------------
# In-memory session store
# ---------------------------------------------------------------------------
sessions: dict[str, SessionState] = {}


# ---------------------------------------------------------------------------
# System prompt template
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_TEMPLATE = """You are an expert technical interviewer at a top-tier tech company. Your name is Alex.
You are conducting a real interview for the following job:

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

INTERVIEW RULES:

1. CONVERSATIONAL REALISM — This must feel like a real human interview, not a quiz.
   - Always BRIEFLY acknowledge the candidate's previous answer before asking the next question. Use natural reactions like "That's a great point," "Interesting approach," "I see," "Got it," "Nice, thanks for sharing that."
   - Keep acknowledgments to ONE short sentence max. Do NOT lecture or evaluate their answer out loud.

2. CONTEXTUAL FOLLOW-UPS — Base your next question on what the candidate just said.
   - If they mention a specific technology, project, metric, or decision — dig deeper into THAT. ("You mentioned you reduced latency by 40 percent — walk me through what specific changes you made.")
   - If they mention a challenge, ask how they overcame it. If they mention a team, ask about their specific role.
   - Do NOT jump to a completely unrelated topic. Each question should feel like a natural continuation of the conversation.
   - You can occasionally introduce a new topic, but bridge it naturally. ("Great, that gives me a good sense of that project. I'd love to hear about some of the other work on your resume — I noticed you also worked on...")

3. Ask ONE question at a time. Wait for the candidate to answer before the next question.

4. Follow this phase order strictly:
   - GREETING: Greet the candidate by name, introduce yourself as Alex, make them feel comfortable. (1-2 exchanges)
   - INTRODUCTION: Ask them to introduce themselves / walk you through their background. (1-2 exchanges)
   - RESUME_DEEP_DIVE: Drill into specific projects on their resume. Ask what THEY did, challenges they faced, decisions they made, results achieved. Be specific — name the project from their resume. Follow up on interesting claims they make. (8-10 questions)
   - TECHNICAL: Ask technical questions relevant to the job description — architecture, system design, debugging, tools, frameworks. Connect them to the candidate's stated experience when possible. (5-7 questions)
   - DSA: If the job requires algorithms/data structures (check JD), ask 1-2 DSA problems. Ask them to walk through their logic step-by-step, not write code. (0-2 questions based on JD)
   - BEHAVIORAL: Ask 2-3 behavioral questions (STAR format expected). E.g., conflict resolution, leadership, failure story. (2-3 questions)
   - CLOSING: Thank them, ask if they have any questions for you, then close the interview professionally.
   - SUMMARY: Never shown to candidate — used internally for report generation.

5. PHASE TRANSITIONS — When moving between phases, use a natural verbal bridge:
   - "Great, I have a really good sense of your background now. Let me shift gears and ask some technical questions."
   - "Thanks for walking me through those projects. I'd like to dive into some deeper technical concepts now."
   - "Alright, switching topics a bit — I'd love to hear about some situations you've navigated."
   Do NOT announce the phase name. Just transition naturally.

6. DSA GENTLE CORRECTION — During the DSA phase:
   - If the candidate proposes a brute-force or suboptimal solution, probe gently: "That would work — what's the time complexity there? Can you think of a way to optimize it?" or "What if the input were sorted? Would that change your approach?"
   - If the candidate is stuck or gives an incorrect approach after probing, briefly share the optimal direction in an encouraging way: "Good effort on thinking through that. Typically for this type of problem, a two-pointer approach works well because... Anyway, let's move on."
   - If the candidate gets the right approach, acknowledge it enthusiastically: "Exactly right — that's the optimal approach."
   - Keep DSA hints brief (1-2 sentences). Do NOT turn into a lecture. Stay in interviewer character.

7. PROBING VAGUE ANSWERS — If the candidate gives a vague answer:
   - Probe with specific follow-ups: "Can you walk me through a concrete example?" or "What specifically was your role versus the rest of the team?"
   - If they mention a result, ask how they measured it. If they mention a decision, ask what the alternatives were.

8. Total questions: 20-30.
9. Keep your responses concise (1-3 sentences max per turn when asking a question, except for DSA hints which can be slightly longer).
10. Do NOT explain the phase or meta-commentary. Just speak naturally as Alex the interviewer.
11. Detect hesitation: if the answer is very short (< 20 words) or says "I don't know / not sure", acknowledge it gracefully and move on. Don't dwell on it.
12. NEVER break character. NEVER say you are an AI.
13. STAY ON TOPIC — Do NOT skip to the next topic if the candidate gives an unrelated response or tries to change the subject. If they haven't answered your question, gently redirect. ("I appreciate that, but I'd love to hear your answer to what I just asked — [rephrase question briefly].")

CURRENT PHASE: {current_phase}
QUESTIONS ASKED SO FAR: {question_count} (this phase: {phase_question_count})

Respond ONLY with what Alex would say out loud. No stage directions. No formatting. Pure natural speech."""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _build_openai_messages(state: SessionState) -> list:
    """Build the OpenAI messages list from session state."""
    system_content = SYSTEM_PROMPT_TEMPLATE.format(
        job_description=state.job_description,
        resume_text=state.resume_text,
        current_phase=state.phase.value,
        question_count=state.question_count,
        phase_question_count=state.phase_question_count,
    )
    messages = [{"role": "system", "content": system_content}]
    for msg in state.messages:
        role = "assistant" if msg.role == "interviewer" else "user"
        messages.append({"role": role, "content": msg.content})
    return messages


def _detect_hesitation(
    answer: str, question: str, duration: Optional[float]
) -> Optional[dict]:
    """
    Detect whether the candidate hesitated on a question.

    Checks for:
    - Uncertainty phrases ("I don't know", "I'm not sure", etc.)
    - Very short answers (< 25 words)
    - Long pauses (> 15 seconds to respond)
    """
    word_count = len(answer.split())
    hesitation_phrases = [
        "i don't know",
        "i'm not sure",
        "hmm",
        "uh",
        "um",
        "i haven't",
        "i never",
        "i can't remember",
        "i forgot",
        "not really",
        "i guess",
        "maybe",
        "i think so",
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
        logger.info(
            f"Hesitation detected: {', '.join(reason)} for question: {question[:80]}..."
        )
        return {
            "question": question,
            "answer": answer,
            "reason": ", ".join(reason),
        }
    return None


def _determine_phase(
    phase_question_count: int,
    current_phase: InterviewPhase,
    job_description: str,
) -> InterviewPhase:
    """
    Determine the next interview phase based on how many questions
    have been answered IN THE CURRENT PHASE.

    Each phase has a minimum number of exchanges before transitioning.
    This ensures the interviewer covers enough ground in each area
    before moving on.
    """
    needs_dsa = any(
        kw in job_description.lower()
        for kw in [
            "algorithm",
            "data structure",
            "leetcode",
            "competitive",
            "dsa",
            "coding interview",
            "software engineer",
            "swe",
            "backend engineer",
            "full stack",
        ]
    )

    # Minimum questions per phase before advancing
    PHASE_MINIMUMS = {
        InterviewPhase.GREETING: 2,
        InterviewPhase.INTRODUCTION: 1,
        InterviewPhase.RESUME_DEEP_DIVE: 8,
        InterviewPhase.TECHNICAL: 5,
        InterviewPhase.DSA: 2,
        InterviewPhase.BEHAVIORAL: 3,
        InterviewPhase.CLOSING: 2,
    }

    min_required = PHASE_MINIMUMS.get(current_phase, 1)

    if phase_question_count < min_required:
        return current_phase  # Stay in current phase

    PHASE_ORDER = [
        InterviewPhase.GREETING,
        InterviewPhase.INTRODUCTION,
        InterviewPhase.RESUME_DEEP_DIVE,
        InterviewPhase.TECHNICAL,
    ]

    if needs_dsa:
        PHASE_ORDER.append(InterviewPhase.DSA)

    PHASE_ORDER.extend([
        InterviewPhase.BEHAVIORAL,
        InterviewPhase.CLOSING,
        InterviewPhase.SUMMARY,
    ])

    try:
        current_idx = PHASE_ORDER.index(current_phase)
        if current_idx + 1 < len(PHASE_ORDER):
            return PHASE_ORDER[current_idx + 1]
    except ValueError:
        pass

    return current_phase


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------
async def create_session(resume_text: str, job_description: str) -> SessionState:
    """Create a new interview session and store it in memory."""
    session_id = str(uuid.uuid4())
    state = SessionState(
        session_id=session_id,
        resume_text=resume_text,
        job_description=job_description,
        phase=InterviewPhase.GREETING,
        created_at=time.time(),
    )
    sessions[session_id] = state
    logger.info(f"Session created: {session_id}")
    return state


def cleanup_stale_sessions(max_age_seconds: int = 7200) -> int:
    """
    Remove sessions older than `max_age_seconds` (default: 2 hours).
    Returns the number of sessions removed.
    """
    now = time.time()
    stale_ids = [
        sid
        for sid, s in sessions.items()
        if now - s.created_at > max_age_seconds
    ]
    for sid in stale_ids:
        del sessions[sid]
    if stale_ids:
        logger.info(f"Cleaned up {len(stale_ids)} stale session(s)")
    return len(stale_ids)


# ---------------------------------------------------------------------------
# Core interview flow
# ---------------------------------------------------------------------------
async def get_next_interviewer_message(
    session_id: str,
    candidate_answer: Optional[str] = None,
    answer_duration: Optional[float] = None,
) -> dict:
    """
    Process the candidate's answer (if any) and generate
    the next interviewer message with TTS audio.
    """
    state = sessions.get(session_id)
    if not state:
        raise ValueError(f"Session {session_id} not found")

    # ---- Add candidate answer to history ----
    if candidate_answer:
        last_question = ""
        for msg in reversed(state.messages):
            if msg.role == "interviewer":
                last_question = msg.content
                break

        hesitation = _detect_hesitation(candidate_answer, last_question, answer_duration)
        if hesitation:
            state.hesitation_flags.append(hesitation)

        state.messages.append(
            Message(
                role="candidate",
                content=candidate_answer,
                phase=state.phase,
                timestamp=time.time(),
            )
        )
        state.question_count += 1
        state.phase_question_count += 1
        old_phase = state.phase
        state.phase = _determine_phase(
            state.phase_question_count, state.phase, state.job_description
        )
        if state.phase != old_phase:
            state.phase_question_count = 0  # Reset counter for new phase
            logger.info(
                f"[{session_id[:8]}] Phase transition: {old_phase.value} → {state.phase.value}"
            )

    # ---- Check if interview is complete ----
    is_final = state.phase == InterviewPhase.SUMMARY or state.question_count >= 30

    # ---- Build messages and call GPT-4o ----
    openai_messages = _build_openai_messages(state)

    if is_final and state.phase != InterviewPhase.CLOSING:
        closing_instruction = {
            "role": "system",
            "content": (
                "Now conclude the interview professionally and warmly. "
                "Thank the candidate, tell them the team will be in touch, "
                "wish them well. Keep it to 3-4 sentences."
            ),
        }
        openai_messages.append(closing_instruction)

    logger.info(
        f"[{session_id[:8]}] Calling GPT-4o (phase={state.phase.value}, q={state.question_count})"
    )

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=openai_messages,
        temperature=0.7,
        max_tokens=300,
    )

    interviewer_text = response.choices[0].message.content.strip()

    # ---- Add interviewer message to history ----
    state.messages.append(
        Message(
            role="interviewer",
            content=interviewer_text,
            phase=state.phase,
            timestamp=time.time(),
        )
    )

    # ---- Extract candidate name from greeting ----
    if state.phase == InterviewPhase.GREETING and not state.candidate_name:
        if candidate_answer:
            try:
                name_extraction = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": (
                                f"Extract only the first name from this text. "
                                f"Reply with ONLY the name, nothing else: '{candidate_answer}'"
                            ),
                        }
                    ],
                    max_tokens=10,
                )
                state.candidate_name = name_extraction.choices[0].message.content.strip()
                logger.info(f"[{session_id[:8]}] Candidate name: {state.candidate_name}")
            except Exception as e:
                logger.warning(f"Name extraction failed: {e}")

    # ---- Generate TTS audio ----
    audio_base64 = await text_to_speech_base64(interviewer_text, voice="onyx")

    # ---- Persist state ----
    sessions[session_id] = state

    return {
        "session_id": session_id,
        "interviewer_text": interviewer_text,
        "audio_base64": audio_base64,
        "phase": state.phase.value,
        "question_number": state.question_count,
        "is_final": is_final,
        "candidate_name": state.candidate_name,
    }


# ---------------------------------------------------------------------------
# Summary report generation
# ---------------------------------------------------------------------------
async def generate_summary_report(session_id: str) -> dict:
    """Generate a full evaluation report for the completed interview."""
    state = sessions.get(session_id)
    if not state:
        raise ValueError(f"Session {session_id} not found")

    logger.info(f"[{session_id[:8]}] Generating summary report")

    # Build full transcript
    transcript = "\n".join(
        [
            f"{'INTERVIEWER' if m.role == 'interviewer' else 'CANDIDATE'}: {m.content}"
            for m in state.messages
        ]
    )

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
        response_format={"type": "json_object"},
    )

    report_data = json.loads(response.choices[0].message.content)
    report_data["session_id"] = session_id
    report_data["candidate_name"] = state.candidate_name
    report_data["total_questions"] = state.question_count

    state.is_complete = True
    sessions[session_id] = state

    logger.info(
        f"[{session_id[:8]}] Summary complete — score: {report_data.get('overall_score')}"
    )

    return report_data


# ---------------------------------------------------------------------------
# Audio transcription (Whisper STT)
# ---------------------------------------------------------------------------
async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe audio bytes using OpenAI Whisper."""
    logger.info(f"Transcribing audio ({len(audio_bytes)} bytes, file={filename})")
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = filename
    transcript = await client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="en",
    )
    text = transcript.text.strip()
    logger.info(f"Transcription result: {text[:100]}...")
    return text
