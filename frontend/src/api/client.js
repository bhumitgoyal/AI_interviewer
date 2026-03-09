const BASE_URL = import.meta.env.VITE_API_URL || "https://backend-34s234k5i-bhumit-goyals-projects.vercel.app";

export async function startSession(resumeFile, jobDescription) {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("job_description", jobDescription);

  const res = await fetch(`${BASE_URL}/api/session/start`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to start session");
  }
  return res.json();
}

export async function submitAnswer(sessionId, answerText, answerDurationSeconds = null) {
  const res = await fetch(`${BASE_URL}/api/interview/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      answer_text: answerText,
      answer_duration_seconds: answerDurationSeconds,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to submit answer");
  }
  return res.json();
}

export async function transcribeAudio(audioBlob, sessionId) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("session_id", sessionId);

  const res = await fetch(`${BASE_URL}/api/interview/transcribe`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Transcription failed");
  }
  return res.json();
}

export async function getSummary(sessionId) {
  const res = await fetch(`${BASE_URL}/api/interview/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Summary generation failed");
  }
  return res.json();
}
