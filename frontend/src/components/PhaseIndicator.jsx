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
