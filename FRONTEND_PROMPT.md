# FRONTEND PROMPT — AI Mock Interview Simulator

## Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + custom CSS variables
- **Fonts**: `Sora` (UI) + `JetBrains Mono` (captions/transcript) — import from Google Fonts
- **State**: React useState / useReducer / useRef
- **Audio**: Web Audio API + MediaRecorder API
- **Camera**: getUserMedia
- **Animation**: Pure CSS keyframes + JS canvas for animated interviewer avatar
- **HTTP**: fetch API (no axios)
- **Icons**: lucide-react
- **No UI libraries** (shadcn, MUI, etc.) — build everything custom

---

## Aesthetic Direction

**Dark, cinematic, premium interview room feel.**
- Background: `#080c14` near-black with a subtle radial gradient in cool indigo
- Primary accent: `#4f8ef7` (electric blue)
- Secondary accent: `#a78bfa` (soft violet)
- Success: `#34d399`
- Warning: `#f59e0b`
- Danger: `#ef4444`
- Text: `#e2e8f0` primary, `#94a3b8` secondary
- Card surfaces: `rgba(255,255,255,0.04)` glassmorphism with `backdrop-filter: blur(12px)` and `border: 1px solid rgba(255,255,255,0.08)`
- Interviewer avatar glows with a pulsing blue ring when speaking

---

## Complete File Structure

```
frontend/
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css              ← global CSS variables + keyframes
│   ├── api/
│   │   └── client.js          ← all API calls
│   ├── hooks/
│   │   ├── useAudioRecorder.js
│   │   ├── useCamera.js
│   │   └── useAudioPlayer.js
│   ├── components/
│   │   ├── SetupScreen.jsx    ← step 1: upload resume + JD
│   │   ├── InterviewRoom.jsx  ← step 2: live interview
│   │   ├── SummaryScreen.jsx  ← step 3: report
│   │   ├── AvatarCanvas.jsx   ← animated AI interviewer face
│   │   ├── CaptionBar.jsx     ← live captions of interviewer speech
│   │   ├── CameraFeed.jsx     ← candidate's webcam preview
│   │   ├── RecordButton.jsx   ← hold to record / release to send
│   │   ├── PhaseIndicator.jsx ← progress bar through interview phases
│   │   └── ScoreCard.jsx      ← reusable score circle for summary
│   └── utils/
│       └── audioUtils.js      ← chunking, blob conversion helpers
```

---

## `package.json`

```json
{
  "name": "ai-interview-simulator",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1"
  }
}
```

---

## `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InterviewAI — Simulate. Prepare. Succeed.</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## `src/index.css`

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-deep: #080c14;
  --bg-surface: rgba(255,255,255,0.04);
  --bg-surface-hover: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.08);
  --border-accent: rgba(79,142,247,0.4);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #4a5568;
  --accent: #4f8ef7;
  --accent-violet: #a78bfa;
  --accent-glow: rgba(79,142,247,0.25);
  --success: #34d399;
  --warning: #f59e0b;
  --danger: #ef4444;
  --font-ui: 'Sora', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html, body { height: 100%; }

body {
  font-family: var(--font-ui);
  background-color: var(--bg-deep);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Keyframes */
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(79,142,247,0.5); }
  70% { box-shadow: 0 0 0 18px rgba(79,142,247,0); }
  100% { box-shadow: 0 0 0 0 rgba(79,142,247,0); }
}

@keyframes float-in {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes blink-bar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes recording-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.85; }
}

@keyframes waveform {
  0%, 100% { height: 4px; }
  50% { height: 20px; }
}

@keyframes mouth-talk {
  0%, 100% { d: path("M 38 58 Q 50 65 62 58"); }
  50% { d: path("M 38 58 Q 50 72 62 58"); }
}

.animate-float-in { animation: float-in 0.5s ease forwards; }
.animate-slide-up { animation: slide-up 0.3s ease forwards; }
.animate-fade-in { animation: fade-in 0.4s ease forwards; }

/* Glass card */
.glass {
  background: var(--bg-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
}

.glass-accent {
  background: rgba(79,142,247,0.06);
  border: 1px solid var(--border-accent);
  border-radius: 16px;
}

/* Button base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f8ef7, #7c6ff7);
  color: white;
  box-shadow: 0 4px 24px rgba(79,142,247,0.3);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 30px rgba(79,142,247,0.4); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-ghost {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn-ghost:hover { background: var(--bg-surface-hover); color: var(--text-primary); }

/* Input */
.input-field {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
  resize: none;
}
.input-field:focus { border-color: var(--accent); background: rgba(79,142,247,0.04); }
.input-field::placeholder { color: var(--text-muted); }
```

---

## `src/api/client.js`

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
```

---

## `src/utils/audioUtils.js`

```javascript
export function base64ToAudioBlob(base64String, mimeType = "audio/mpeg") {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
```

---

## `src/hooks/useAudioRecorder.js`

```javascript
import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
    };

    startTimeRef.current = Date.now();
    setRecordingDuration(0);
    timerRef.current = setInterval(() => {
      setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    mediaRecorder.start(200);
    setIsRecording(true);
    setAudioBlob(null);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setRecordingDuration(0);
  }, []);

  const getFinalDuration = useCallback(() => {
    if (!startTimeRef.current) return null;
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  return {
    isRecording,
    audioBlob,
    recordingDuration,
    startRecording,
    stopRecording,
    clearRecording,
    getFinalDuration,
  };
}
```

---

## `src/hooks/useCamera.js`

```javascript
import { useState, useRef, useCallback, useEffect } from "react";

export function useCamera(videoRef) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please allow camera access to continue.");
      setHasPermission(false);
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return { hasPermission, error, startCamera, stopCamera };
}
```

---

## `src/hooks/useAudioPlayer.js`

```javascript
import { useState, useRef, useCallback } from "react";
import { base64ToAudioBlob } from "../utils/audioUtils";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const playBase64Audio = useCallback((base64String, onEnd) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const blob = base64ToAudioBlob(base64String);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };

    audio.play().catch(console.error);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, playBase64Audio, stop };
}
```

---

## `src/components/AvatarCanvas.jsx`

```jsx
import { useRef, useEffect } from "react";

// Animated SVG-based interviewer avatar with talking animation
export default function AvatarCanvas({ isSpeaking, isThinking }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);

      // Background circle gradient
      const bgGrad = ctx.createRadialGradient(W/2, H/2, 20, W/2, H/2, W/2);
      bgGrad.addColorStop(0, "rgba(79,142,247,0.12)");
      bgGrad.addColorStop(1, "rgba(8,12,20,0)");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(W/2, H/2, W/2, 0, Math.PI*2);
      ctx.fill();

      // Outer pulsing ring when speaking
      if (isSpeaking) {
        const pulse = (Math.sin(t * 0.004) + 1) / 2;
        ctx.strokeStyle = `rgba(79,142,247,${0.2 + pulse * 0.4})`;
        ctx.lineWidth = 2 + pulse * 3;
        ctx.beginPath();
        ctx.arc(W/2, H/2, W/2 - 4, 0, Math.PI*2);
        ctx.stroke();
      }

      // Head
      const headGrad = ctx.createRadialGradient(W/2-8, H/2-15, 5, W/2, H/2, 55);
      headGrad.addColorStop(0, "#fde68a");
      headGrad.addColorStop(0.6, "#fbbf24");
      headGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(W/2, H/2 - 8, 42, 48, 0, 0, Math.PI*2);
      ctx.fill();

      // Neck
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.rect(W/2 - 14, H/2 + 34, 28, 20);
      ctx.fill();

      // Suit/shoulders
      const suitGrad = ctx.createLinearGradient(0, H/2+50, 0, H);
      suitGrad.addColorStop(0, "#1e3a5f");
      suitGrad.addColorStop(1, "#0f2040");
      ctx.fillStyle = suitGrad;
      ctx.beginPath();
      ctx.moveTo(W/2 - 55, H);
      ctx.lineTo(W/2 - 38, H/2 + 48);
      ctx.quadraticCurveTo(W/2, H/2 + 55, W/2 + 38, H/2 + 48);
      ctx.lineTo(W/2 + 55, H);
      ctx.closePath();
      ctx.fill();

      // Tie
      ctx.fillStyle = "#4f8ef7";
      ctx.beginPath();
      ctx.moveTo(W/2 - 5, H/2 + 50);
      ctx.lineTo(W/2 + 5, H/2 + 50);
      ctx.lineTo(W/2 + 3, H/2 + 80);
      ctx.lineTo(W/2, H/2 + 88);
      ctx.lineTo(W/2 - 3, H/2 + 80);
      ctx.closePath();
      ctx.fill();

      // Hair
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.ellipse(W/2, H/2 - 48, 42, 18, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W/2 - 26, H/2 - 32, 16, 28, -0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W/2 + 26, H/2 - 32, 16, 28, 0.3, 0, Math.PI*2);
      ctx.fill();

      // Eyes
      const eyeBlinkFreq = 0.0007;
      const blinkCycle = Math.sin(t * eyeBlinkFreq);
      const eyeH = blinkCycle > 0.97 ? 1 : 10;

      // Eye whites
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.ellipse(W/2 - 14, H/2 - 8, 10, eyeH, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W/2 + 14, H/2 - 8, 10, eyeH, 0, 0, Math.PI*2);
      ctx.fill();

      // Pupils (slight look-around)
      const lookX = Math.sin(t * 0.0008) * 3;
      const lookY = Math.cos(t * 0.0011) * 2;
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.ellipse(W/2 - 14 + lookX, H/2 - 8 + lookY, 5, Math.min(5, eyeH), 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(W/2 + 14 + lookX, H/2 - 8 + lookY, 5, Math.min(5, eyeH), 0, 0, Math.PI*2);
      ctx.fill();

      // Glasses
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(W/2 - 28, H/2 - 20, 24, 18, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(W/2 + 4, H/2 - 20, 24, 18, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W/2 - 4, H/2 - 11);
      ctx.lineTo(W/2 + 4, H/2 - 11);
      ctx.stroke();
      // Temple pieces
      ctx.beginPath();
      ctx.moveTo(W/2 - 28, H/2 - 11);
      ctx.lineTo(W/2 - 40, H/2 - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W/2 + 28, H/2 - 11);
      ctx.lineTo(W/2 + 40, H/2 - 8);
      ctx.stroke();

      // Eyebrows
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      const browRaise = isThinking ? -6 : 0;
      ctx.beginPath();
      ctx.moveTo(W/2 - 24, H/2 - 24 + browRaise);
      ctx.quadraticCurveTo(W/2 - 14, H/2 - 27 + browRaise, W/2 - 4, H/2 - 24 + browRaise);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W/2 + 4, H/2 - 24 + browRaise);
      ctx.quadraticCurveTo(W/2 + 14, H/2 - 27 + browRaise, W/2 + 24, H/2 - 24 + browRaise);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W/2, H/2 - 2);
      ctx.lineTo(W/2 - 5, H/2 + 10);
      ctx.lineTo(W/2 - 2, H/2 + 12);
      ctx.stroke();

      // Mouth — animate when speaking
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      if (isSpeaking) {
        const talkCycle = Math.sin(t * 0.02);
        const mouthOpen = Math.abs(talkCycle) * 8;
        ctx.beginPath();
        ctx.moveTo(W/2 - 12, H/2 + 22);
        ctx.quadraticCurveTo(W/2, H/2 + 28 + mouthOpen, W/2 + 12, H/2 + 22);
        ctx.stroke();
        if (mouthOpen > 2) {
          ctx.fillStyle = "#7c2d12";
          ctx.beginPath();
          ctx.moveTo(W/2 - 10, H/2 + 23);
          ctx.quadraticCurveTo(W/2, H/2 + 28 + mouthOpen, W/2 + 10, H/2 + 23);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(W/2 - 12, H/2 + 24);
        ctx.quadraticCurveTo(W/2, H/2 + 28, W/2 + 12, H/2 + 24);
        ctx.stroke();
      }

      // Thinking indicator — 3 dots
      if (isThinking) {
        for (let i = 0; i < 3; i++) {
          const dotPhase = (t * 0.005 + i * 0.5) % (Math.PI * 2);
          const dotY = Math.sin(dotPhase) * 4;
          ctx.fillStyle = `rgba(79,142,247,${0.5 + Math.sin(dotPhase) * 0.5})`;
          ctx.beginPath();
          ctx.arc(W/2 + 25 + i * 10, H/2 - 20 + dotY, 3, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

    function loop(timestamp) {
      frameRef.current = timestamp;
      drawFrame(timestamp);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpeaking, isThinking]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={160}
      style={{ borderRadius: "50%", display: "block" }}
    />
  );
}
```

---

## `src/components/CaptionBar.jsx`

```jsx
import { useEffect, useState, useRef } from "react";

export default function CaptionBar({ text, isActive }) {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) { setDisplayed(""); indexRef.current = 0; return; }
    setDisplayed("");
    indexRef.current = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(timerRef.current);
      }
    }, 22);
    return () => clearInterval(timerRef.current);
  }, [text]);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  if (!isActive && !displayed) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: 680,
      background: "rgba(8,12,20,0.88)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "14px 20px",
      fontFamily: "var(--font-mono)",
      fontSize: 15,
      lineHeight: 1.6,
      color: "#e2e8f0",
      textAlign: "center",
      zIndex: 50,
      animation: "fade-in 0.3s ease",
      minHeight: 52,
    }}>
      <span style={{ color: "#4f8ef7", fontWeight: 600, marginRight: 8, fontSize: 13 }}>ALEX</span>
      {displayed}
      {cursor && (
        <span style={{
          display: "inline-block",
          width: 2,
          height: "1em",
          background: "#4f8ef7",
          marginLeft: 2,
          verticalAlign: "middle",
          animation: "blink-bar 1s step-start infinite"
        }} />
      )}
    </div>
  );
}
```

---

## `src/components/CameraFeed.jsx`

```jsx
import { useEffect } from "react";
import { useCamera } from "../hooks/useCamera";

export default function CameraFeed({ videoRef, onReady }) {
  const { hasPermission, error, startCamera } = useCamera(videoRef);

  useEffect(() => {
    startCamera().then(() => onReady?.());
  }, []);

  return (
    <div style={{
      width: "100%",
      aspectRatio: "16/9",
      background: "#0d1117",
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      border: "1px solid var(--border)"
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          display: hasPermission ? "block" : "none"
        }}
      />
      {!hasPermission && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, padding: 16, textAlign: "center"
        }}>
          <div style={{ fontSize: 32 }}>📷</div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {error || "Requesting camera access..."}
          </p>
        </div>
      )}
      {hasPermission && (
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          background: "rgba(0,0,0,0.6)",
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 11,
          color: "var(--text-secondary)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#34d399", display: "inline-block",
            animation: "recording-pulse 2s ease infinite"
          }} />
          You
        </div>
      )}
    </div>
  );
}
```

---

## `src/components/RecordButton.jsx`

```jsx
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader } from "lucide-react";

export default function RecordButton({ onRecordComplete, isDisabled, isLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const [analyserBars, setAnalyserBars] = useState([4,4,4,4,4,4,4]);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  function updateBars() {
    if (!analyserRef.current) return;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const slice = Math.floor(dataArrayRef.current.length / 7);
    const bars = Array.from({length: 7}, (_, i) => {
      const val = dataArrayRef.current[i * slice] || 0;
      return Math.max(3, Math.floor((val / 255) * 24));
    });
    setAnalyserBars(bars);
    animFrameRef.current = requestAnimationFrame(updateBars);
  }

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    animFrameRef.current = requestAnimationFrame(updateBars);

    const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const dur = (Date.now() - startTimeRef.current) / 1000;
      stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      setAnalyserBars([4,4,4,4,4,4,4]);
      audioCtx.close();
      onRecordComplete(blob, dur);
    };
    mr.start(100);
    startTimeRef.current = Date.now();
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setIsRecording(true);
  }

  function stopRec() {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    setDuration(0);
  }

  useEffect(() => () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleClick = () => {
    if (isDisabled || isLoading) return;
    if (isRecording) stopRec(); else startRec();
  };

  const mins = String(Math.floor(duration / 60)).padStart(2, "0");
  const secs = String(duration % 60).padStart(2, "0");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Waveform bars */}
      <div style={{
        display: "flex", alignItems: "center", gap: 3, height: 28,
        opacity: isRecording ? 1 : 0.3, transition: "opacity 0.3s"
      }}>
        {analyserBars.map((h, i) => (
          <div key={i} style={{
            width: 3, height: h,
            background: `linear-gradient(to top, #4f8ef7, #a78bfa)`,
            borderRadius: 2,
            transition: "height 0.05s ease"
          }} />
        ))}
      </div>

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          width: 72, height: 72,
          borderRadius: "50%",
          border: isRecording ? "2px solid #ef4444" : "2px solid var(--border-accent)",
          background: isRecording
            ? "radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0.05))"
            : "radial-gradient(circle, rgba(79,142,247,0.15), rgba(79,142,247,0.03))",
          cursor: isLoading || isDisabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          animation: isRecording ? "recording-pulse 1.5s ease infinite" : "none",
          opacity: isDisabled ? 0.4 : 1,
          boxShadow: isRecording
            ? "0 0 0 0 rgba(239,68,68,0.4)"
            : "0 0 24px rgba(79,142,247,0.2)"
        }}
      >
        {isLoading
          ? <Loader size={24} color="#4f8ef7" style={{ animation: "spin 1s linear infinite" }} />
          : isRecording
            ? <MicOff size={24} color="#ef4444" />
            : <Mic size={24} color="#4f8ef7" />
        }
      </button>

      {/* Status text */}
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: isRecording ? "#ef4444" : "var(--text-secondary)"
      }}>
        {isLoading ? "Processing..." : isRecording ? `Recording ${mins}:${secs}` : "Tap to speak"}
      </p>
    </div>
  );
}
```

---

## `src/components/PhaseIndicator.jsx`

```jsx
const PHASES = [
  { id: "greeting", label: "Greeting" },
  { id: "introduction", label: "Intro" },
  { id: "resume_deep_dive", label: "Resume" },
  { id: "technical", label: "Technical" },
  { id: "dsa", label: "DSA" },
  { id: "behavioral", label: "Behavioral" },
  { id: "closing", label: "Closing" },
];

export default function PhaseIndicator({ currentPhase }) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
      {PHASES.map((phase, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={phase.id} style={{ display: "flex", alignItems: "center", flex: i < PHASES.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: isDone ? "#34d399" : isActive ? "#4f8ef7" : "var(--border)",
                boxShadow: isActive ? "0 0 8px rgba(79,142,247,0.6)" : "none",
                transition: "all 0.4s",
                flexShrink: 0
              }} />
              <span style={{
                fontSize: 9,
                color: isDone ? "#34d399" : isActive ? "#4f8ef7" : "var(--text-muted)",
                whiteSpace: "nowrap",
                fontWeight: isActive ? 600 : 400,
                transition: "color 0.4s"
              }}>{phase.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div style={{
                flex: 1,
                height: 1,
                background: isDone ? "#34d399" : "var(--border)",
                marginBottom: 14,
                transition: "background 0.4s"
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## `src/components/ScoreCard.jsx`

```jsx
import { useEffect, useRef } from "react";

export default function ScoreCard({ score, label, color = "#4f8ef7" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, r = W/2 - 8;
    let current = 0;

    const step = () => {
      ctx.clearRect(0, 0, W, H);
      // Background arc
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, 1.5*Math.PI);
      ctx.stroke();
      // Fill arc
      const end = -Math.PI/2 + (current / 100) * 2 * Math.PI;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "99");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, end);
      ctx.stroke();
      // Score text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 22px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(current), cx, cy - 3);
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "10px Sora, sans-serif";
      ctx.fillText("/100", cx, cy + 14);

      if (current < score) {
        current = Math.min(current + 1.5, score);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [score, color]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <canvas ref={canvasRef} width={100} height={100} />
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
```

---

## `src/components/SetupScreen.jsx`

```jsx
import { useState, useRef } from "react";
import { Upload, FileText, Briefcase, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { startSession } from "../api/client";

export default function SetupScreen({ onSessionStart }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") setResumeFile(file);
    else setError("Please upload a PDF file.");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") { setResumeFile(file); setError(""); }
    else setError("Please upload a PDF file.");
  };

  const handleStart = async () => {
    if (!resumeFile) { setError("Please upload your resume."); return; }
    if (jobDescription.trim().length < 50) { setError("Job description too short (min 50 characters)."); return; }
    setIsLoading(true);
    setError("");
    try {
      const data = await startSession(resumeFile, jobDescription);
      onSessionStart(data);
    } catch (e) {
      setError(e.message || "Failed to start session.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-deep)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background blobs */}
      <div style={{
        position: "fixed", top: -200, right: -200,
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: -200, left: -200,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: 640, animation: "float-in 0.6s ease forwards" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)",
            borderRadius: 20, padding: "6px 16px", marginBottom: 20,
            fontSize: 12, color: "#4f8ef7", fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "recording-pulse 2s ease infinite" }} />
            AI-Powered Interview Simulator
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800,
            background: "linear-gradient(135deg, #e2e8f0 30%, #4f8ef7 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.15, marginBottom: 14
          }}>
            Practice Like It's Real
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            Upload your resume, paste the job description, and interview with Alex — your AI interviewer — in a live simulation.
          </p>
        </div>

        {/* Resume Upload */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Resume (PDF)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#4f8ef7" : resumeFile ? "#34d399" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12,
              padding: "28px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: isDragging ? "rgba(79,142,247,0.05)" : resumeFile ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.02)",
              transition: "all 0.2s"
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: "none" }} />
            {resumeFile ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <CheckCircle size={20} color="#34d399" />
                <span style={{ color: "#34d399", fontWeight: 600, fontSize: 14 }}>{resumeFile.name}</span>
              </div>
            ) : (
              <>
                <Upload size={28} color="#4f8ef7" style={{ marginBottom: 10 }} />
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Drag & drop or <span style={{ color: "#4f8ef7", fontWeight: 600 }}>browse</span></p>
                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>PDF only · Max 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Job Description
          </label>
          <textarea
            className="input-field"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here — the more detail, the better your mock interview..."
            rows={7}
            style={{ fontFamily: "var(--font-ui)", lineHeight: 1.7 }}
          />
          <p style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            {jobDescription.length} characters
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 20,
            color: "#ef4444", fontSize: 14
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Start Button */}
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={isLoading || !resumeFile || jobDescription.length < 50}
          style={{ width: "100%", height: 52, fontSize: 16 }}
        >
          {isLoading ? (
            <>Analyzing Resume…</>
          ) : (
            <>Start Interview <ChevronRight size={18} /></>
          )}
        </button>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 16 }}>
          You'll need camera + microphone access · Interview lasts ~20–30 questions
        </p>
      </div>
    </div>
  );
}
```

---

## `src/components/InterviewRoom.jsx`

```jsx
import { useState, useRef, useEffect, useCallback } from "react";
import AvatarCanvas from "./AvatarCanvas";
import CaptionBar from "./CaptionBar";
import CameraFeed from "./CameraFeed";
import RecordButton from "./RecordButton";
import PhaseIndicator from "./PhaseIndicator";
import { transcribeAudio, submitAnswer, getSummary } from "../api/client";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const INTERVIEWER_NAME = "Alex";

export default function InterviewRoom({ sessionId, firstMessage, onInterviewEnd }) {
  const [phase, setPhase] = useState(firstMessage.phase || "greeting");
  const [questionCount, setQuestionCount] = useState(firstMessage.question_number || 0);
  const [currentCaption, setCurrentCaption] = useState("");
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const { isPlaying, playBase64Audio } = useAudioPlayer();
  const videoRef = useRef(null);
  const historyRef = useRef(null);

  const playInterviewerMessage = useCallback((text, audioBase64, onEnd) => {
    setCurrentCaption(text);
    setIsInterviewerSpeaking(true);
    setCanSpeak(false);
    playBase64Audio(audioBase64, () => {
      setIsInterviewerSpeaking(false);
      setCanSpeak(true);
      if (onEnd) onEnd();
    });
  }, [playBase64Audio]);

  // Play first message on mount
  useEffect(() => {
    setMessageHistory([{ role: "interviewer", text: firstMessage.interviewer_text }]);
    setTimeout(() => {
      playInterviewerMessage(firstMessage.interviewer_text, firstMessage.audio_base64);
    }, 800);
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messageHistory]);

  const handleRecordComplete = async (blob, duration) => {
    setIsProcessing(true);
    setCanSpeak(false);
    setTranscript("");

    try {
      // Transcribe
      const transcribeRes = await transcribeAudio(blob, sessionId);
      const candidateText = transcribeRes.transcript;
      setTranscript(candidateText);
      setMessageHistory(h => [...h, { role: "candidate", text: candidateText }]);

      // Send to backend and get next interviewer message
      setIsThinking(true);
      const response = await submitAnswer(sessionId, candidateText, duration);
      setIsThinking(false);

      setPhase(response.phase);
      setQuestionCount(response.question_number);
      setMessageHistory(h => [...h, { role: "interviewer", text: response.interviewer_text }]);

      if (response.is_final) {
        playInterviewerMessage(response.interviewer_text, response.audio_base64, async () => {
          setIsFinalizing(true);
          setCurrentCaption("Generating your performance report...");
          const report = await getSummary(sessionId);
          onInterviewEnd(report);
        });
      } else {
        playInterviewerMessage(response.interviewer_text, response.audio_base64);
      }
    } catch (err) {
      console.error(err);
      setIsThinking(false);
      setCanSpeak(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-deep)",
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gridTemplateRows: "auto 1fr auto",
      gap: 0,
      overflow: "hidden"
    }}>
      {/* Top bar */}
      <div style={{
        gridColumn: "1 / -1",
        padding: "16px 28px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "rgba(8,12,20,0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#34d399",
            animation: "recording-pulse 2s ease infinite"
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#34d399" }}>LIVE</span>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>·</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Q {questionCount} of ~25</span>
        </div>
        <div style={{ flex: 1 }}>
          <PhaseIndicator currentPhase={phase} />
        </div>
      </div>

      {/* Main interview area */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        minHeight: 0,
        overflow: "hidden"
      }}>
        {/* Background radial glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          transition: "opacity 0.5s",
          opacity: isInterviewerSpeaking ? 1 : 0.4
        }} />

        {/* Interviewer Avatar */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginBottom: 24
        }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            border: isInterviewerSpeaking ? "2px solid rgba(79,142,247,0.8)" : "2px solid rgba(255,255,255,0.08)",
            boxShadow: isInterviewerSpeaking ? "0 0 40px rgba(79,142,247,0.3), 0 0 0 8px rgba(79,142,247,0.05)" : "none",
            transition: "all 0.4s",
            animation: isInterviewerSpeaking ? "pulse-ring 1.8s ease infinite" : "none",
            overflow: "hidden",
            flexShrink: 0
          }}>
            <AvatarCanvas isSpeaking={isInterviewerSpeaking} isThinking={isThinking} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{INTERVIEWER_NAME}</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {isThinking ? "Thinking..." : isInterviewerSpeaking ? "Speaking..." : canSpeak ? "Your turn" : "Waiting..."}
            </p>
          </div>
        </div>

        {/* Caption bar */}
        <div style={{ position: "relative", width: "100%", maxWidth: 620, minHeight: 80 }}>
          <CaptionBar text={currentCaption} isActive={isInterviewerSpeaking || isThinking} />
        </div>

        {/* Record button */}
        <div style={{ marginTop: 32 }}>
          <RecordButton
            onRecordComplete={handleRecordComplete}
            isDisabled={!canSpeak || isFinalizing}
            isLoading={isProcessing || isThinking}
          />
        </div>

        {/* Last transcript */}
        {transcript && (
          <div style={{
            marginTop: 16,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            maxWidth: 500,
            fontSize: 13,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1.5,
            animation: "slide-up 0.3s ease"
          }}>
            <span style={{ color: "var(--accent-violet)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>You said: </span>
            {transcript}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflow: "hidden",
        background: "rgba(255,255,255,0.01)"
      }}>
        {/* Camera */}
        <div style={{ padding: 16 }}>
          <CameraFeed videoRef={videoRef} />
        </div>

        {/* Conversation history */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderTop: "1px solid var(--border)"
        }}>
          <p style={{
            padding: "10px 16px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0
          }}>Transcript</p>
          <div
            ref={historyRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            {messageHistory.map((msg, i) => (
              <div key={i} style={{ animation: "slide-up 0.2s ease" }}>
                <p style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: msg.role === "interviewer" ? "#4f8ef7" : "#a78bfa",
                  textTransform: "uppercase",
                  marginBottom: 3,
                  letterSpacing: "0.05em"
                }}>
                  {msg.role === "interviewer" ? INTERVIEWER_NAME : "You"}
                </p>
                <p style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  fontFamily: "var(--font-mono)"
                }}>
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## `src/components/SummaryScreen.jsx`

```jsx
import ScoreCard from "./ScoreCard";
import { CheckCircle, AlertTriangle, TrendingUp, MessageSquare, Zap, Award } from "lucide-react";

export default function SummaryScreen({ report, onRestart }) {
  const verdictColor = report.final_verdict?.toLowerCase().includes("hired")
    ? "#34d399"
    : report.final_verdict?.toLowerCase().includes("reject")
    ? "#ef4444"
    : "#f59e0b";

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-deep)",
      padding: "48px 24px",
      overflowY: "auto"
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48, animation: "float-in 0.5s ease" }}>
          <div style={{
            display: "inline-block",
            background: `rgba(${verdictColor === "#34d399" ? "52,211,153" : verdictColor === "#ef4444" ? "239,68,68" : "245,158,11"},0.1)`,
            border: `1px solid ${verdictColor}40`,
            borderRadius: 20, padding: "8px 20px",
            fontSize: 13, fontWeight: 700,
            color: verdictColor,
            marginBottom: 20,
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            {report.final_verdict}
          </div>
          <h1 style={{
            fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800,
            background: "linear-gradient(135deg, #e2e8f0 30%, #4f8ef7 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 10
          }}>
            Interview Complete{report.candidate_name ? `, ${report.candidate_name}` : ""}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            {report.total_questions} questions · Performance report ready
          </p>
        </div>

        {/* Score cards */}
        <div className="glass" style={{ padding: 32, marginBottom: 24, animation: "float-in 0.5s 0.1s ease both" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>Performance Scores</h2>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20 }}>
            <ScoreCard score={report.overall_score} label="Overall" color="#4f8ef7" />
            <ScoreCard score={report.technical_score} label="Technical" color="#a78bfa" />
            <ScoreCard score={report.communication_score} label="Communication" color="#34d399" />
            <ScoreCard score={report.confidence_score} label="Confidence" color="#f59e0b" />
          </div>
        </div>

        {/* Strengths + Weaknesses */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, animation: "float-in 0.5s 0.2s ease both" }}>
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <CheckCircle size={16} color="#34d399" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#34d399" }}>Strengths</h3>
            </div>
            {report.strengths?.map((s, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                marginBottom: 10, animation: `slide-up 0.3s ${i * 0.05}s ease both`
              }}>
                <span style={{ color: "#34d399", flexShrink: 0, marginTop: 2 }}>✓</span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <TrendingUp size={16} color="#f59e0b" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>Areas to Improve</h3>
            </div>
            {report.weaknesses?.map((w, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                marginBottom: 10, animation: `slide-up 0.3s ${i * 0.05}s ease both`
              }}>
                <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }}>→</span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{w}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Better answers */}
        {report.better_answers?.length > 0 && (
          <div className="glass" style={{ padding: 28, marginBottom: 24, animation: "float-in 0.5s 0.3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Zap size={16} color="#4f8ef7" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>How You Could Have Answered Better</h3>
            </div>
            {report.better_answers.map((item, i) => (
              <div key={i} style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: i < report.better_answers.length - 1 ? "1px solid var(--border)" : "none"
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#4f8ef7", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Question
                </p>
                <p style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 10, fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
                  {item.question}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#ef4444", marginBottom: 6, textTransform: "uppercase" }}>Your Answer</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.candidate_answer}</p>
                  </div>
                  <div style={{ background: "rgba(52,211,153,0.06)", borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#34d399", marginBottom: 6, textTransform: "uppercase" }}>Ideal Answer</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.ideal_answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hesitation moments */}
        {report.hesitation_moments?.length > 0 && (
          <div className="glass" style={{ padding: 28, marginBottom: 24, animation: "float-in 0.5s 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <AlertTriangle size={16} color="#f59e0b" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Hesitation Moments</h3>
            </div>
            {report.hesitation_moments.map((h, i) => (
              <div key={i} style={{
                marginBottom: 14,
                padding: "12px 16px",
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.15)",
                borderRadius: 8
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>{h.question}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{h.analysis || h.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Detailed feedback */}
        <div className="glass" style={{ padding: 28, marginBottom: 32, animation: "float-in 0.5s 0.5s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <MessageSquare size={16} color="#a78bfa" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Detailed Feedback</h3>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {report.detailed_feedback}
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", animation: "float-in 0.5s 0.6s ease both" }}>
          <button className="btn btn-primary" onClick={onRestart} style={{ minWidth: 200, height: 52 }}>
            <Award size={18} /> Practice Again
          </button>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 12 }}>
            Each session uses your real resume + job description for maximum relevance
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## `src/App.jsx`

```jsx
import { useState } from "react";
import SetupScreen from "./components/SetupScreen";
import InterviewRoom from "./components/InterviewRoom";
import SummaryScreen from "./components/SummaryScreen";

export default function App() {
  const [screen, setScreen] = useState("setup"); // "setup" | "interview" | "summary"
  const [sessionData, setSessionData] = useState(null);
  const [summaryReport, setSummaryReport] = useState(null);

  const handleSessionStart = (data) => {
    setSessionData(data);
    setScreen("interview");
  };

  const handleInterviewEnd = (report) => {
    setSummaryReport(report);
    setScreen("summary");
  };

  const handleRestart = () => {
    setSessionData(null);
    setSummaryReport(null);
    setScreen("setup");
  };

  if (screen === "setup") {
    return <SetupScreen onSessionStart={handleSessionStart} />;
  }

  if (screen === "interview" && sessionData) {
    return (
      <InterviewRoom
        sessionId={sessionData.session_id}
        firstMessage={sessionData.first_message}
        onInterviewEnd={handleInterviewEnd}
      />
    );
  }

  if (screen === "summary" && summaryReport) {
    return <SummaryScreen report={summaryReport} onRestart={handleRestart} />;
  }

  return null;
}
```

---

## `src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## `vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/ws": { target: "ws://localhost:8000", ws: true }
    }
  }
});
```

---

## `.env` (frontend)

```
VITE_API_URL=http://localhost:8000
```

---

## How to Run

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Summary of What This Builds

| Feature | Implementation |
|--------|----------------|
| PDF Resume Upload | Drag-and-drop + file picker → pdfplumber backend |
| Job Description | Multi-line textarea, passed to GPT-4o system prompt |
| Animated Interviewer | Canvas-drawn avatar, mouth moves when speaking |
| Text-to-Speech | OpenAI TTS `onyx` voice, base64 MP3 streamed to frontend |
| Live Captions | Typewriter-effect caption bar synced to TTS |
| Camera Feed | getUserMedia mirrored video, bottom-left "You" label |
| Voice Recording | MediaRecorder → Blob → Whisper STT → answer text |
| Phase-Aware Questioning | GREETING → INTRO → RESUME → TECH → DSA → BEHAVIORAL → CLOSING |
| Hesitation Detection | Short answers + long pauses + uncertainty phrases flagged |
| Full Summary Report | Scores, strengths, weaknesses, ideal answers, hesitation analysis |
| Restart | One-click restart with fresh session |
