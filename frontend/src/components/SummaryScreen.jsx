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
