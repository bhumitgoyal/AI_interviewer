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
