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
