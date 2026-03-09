import { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronDown, Mic, FileText, Brain, BarChart3, Zap, Shield, Github, Linkedin, Mail } from "lucide-react";

// Scroll reveal hook
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// Animated counter
function Counter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const stepTime = 16;
        const steps = duration / stepTime;
        const inc = end / steps;
        const timer = setInterval(() => {
          start += inc;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, stepTime);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: Mic, title: "Voice-Powered Interviews", desc: "Speak naturally — your answers are transcribed in real-time with OpenAI Whisper and responded to by your AI interviewer, Alex." },
  { icon: FileText, title: "Resume-Aware Questions", desc: "Alex reads your actual resume and drills into your specific projects, tech stack, and experience — just like a real interviewer." },
  { icon: Brain, title: "Adaptive Interview Phases", desc: "The interview follows a structured 7-phase flow — from greeting to technical deep-dives to behavioral questions — covering 20-30 questions." },
  { icon: BarChart3, title: "Detailed Performance Report", desc: "Get scored on technical depth, communication, and confidence. See strengths, weaknesses, hesitation moments, and ideal answers side by side." },
  { icon: Zap, title: "Real-Time AI Responses", desc: "Alex responds instantly with natural voice via TTS. No waiting, no awkward pauses — it feels like a real conversation." },
  { icon: Shield, title: "Private & Secure", desc: "Your resume and responses are processed in-session only. Nothing is stored permanently — your data stays yours." },
];

const STEPS = [
  { num: "01", title: "Upload & Set Up", desc: "Upload your PDF resume and paste the job description you're preparing for. InterviewAI analyzes both to tailor your interview." },
  { num: "02", title: "Interview with Alex", desc: "Enter a live interview room with your AI interviewer. Speak into your mic, see yourself on camera, and watch Alex respond with voice and subtitles in real-time." },
  { num: "03", title: "Get Your Report", desc: "After ~25 questions, receive a comprehensive performance report with scores out of 100, strengths and weaknesses, and suggested ideal answers." },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Software Engineer → FAANG", text: "I landed my dream job at Google after practicing with InterviewAI. The resume deep-dive questions were scarily realistic — it knew exactly which projects to probe.", avatar: "PS" },
  { name: "Marcus T.", role: "Bootcamp Grad", text: "Coming from a bootcamp, I had zero interview experience. InterviewAI gave me the confidence to walk into my first real interview prepared. Got an offer on my second try!", avatar: "MT" },
  { name: "Sarah K.", role: "Engineering Manager", text: "Even as a senior engineer, the behavioral questions caught me off guard. The detailed feedback showed me exactly where I could improve my STAR answers.", avatar: "SK" },
];

const FAQS = [
  { q: "How realistic is the AI interviewer?", a: "Alex is powered by GPT-4o and follows the exact structure of a real technical interview — greeting, resume deep-dive, technical questions, behavioral, and closing. It probes vague answers and adapts based on your resume." },
  { q: "What do I need to get started?", a: "Just a PDF resume, a job description, and a browser with mic/camera access. No downloads required." },
  { q: "How long does an interview take?", a: "A typical session covers 20-30 questions and lasts about 25-40 minutes, similar to a real first-round interview." },
  { q: "Is my data stored?", a: "No. Sessions are held in-memory and automatically cleaned up after 2 hours. Your resume and answers are not persisted anywhere." },
  { q: "What's in the performance report?", a: "You get an overall score (0-100), technical/communication/confidence sub-scores, a list of strengths and weaknesses, hesitation detection analysis, and ideal answers for questions you underperformed on." },
  { q: "Can I use this for non-technical roles?", a: "While the system excels at technical interviews (SWE, backend, full-stack), it adapts to any job description you provide — including PM, marketing, and leadership roles." },
];



export default function LandingPage({ onStartInterview }) {
  const [openFaq, setOpenFaq] = useState(null);

  const heroRef = useReveal();
  const statsRef = useReveal();
  const howRef = useReveal();
  const featuresRef = useReveal();
  const testimonialsRef = useReveal();

  const faqRef = useReveal();
  const ctaRef = useReveal();

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh", overflowX: "hidden" }}>
      {/* ============ NAVBAR ============ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 32px",
        background: "rgba(8,12,20,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #4f8ef7, #7c6ff7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "white"
          }}>A</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>InterviewAI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#features" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}>Features</a>
          <a href="#how-it-works" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}>How It Works</a>
          <a href="#faq" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}>FAQ</a>
          <button className="btn btn-primary" onClick={onStartInterview} style={{ padding: "8px 20px", fontSize: 13 }}>
            Start Free Interview
          </button>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="reveal" style={{
        paddingTop: 140, paddingBottom: 80,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: -100, right: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -200, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)",
              borderRadius: 20, padding: "6px 16px", marginBottom: 24,
              fontSize: 12, color: "#4f8ef7", fontWeight: 600, letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", display: "inline-block", animation: "recording-pulse 2s ease infinite" }} />
              AI-Powered Mock Interviews
            </div>
            <h1 style={{
              fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800,
              lineHeight: 1.1, marginBottom: 20,
              background: "linear-gradient(135deg, #e2e8f0 30%, #4f8ef7 70%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Practice Like It's Real
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              Upload your resume. Face a real AI interviewer. Get scored. Powered by GPT-4o for the most realistic interview simulation available.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn btn-primary" onClick={onStartInterview} style={{ padding: "14px 32px", fontSize: 16 }}>
                Start Free Interview <ChevronRight size={18} />
              </button>
              <a href="#how-it-works" className="btn btn-ghost" style={{ padding: "14px 24px", fontSize: 14, textDecoration: "none" }}>
                See How It Works
              </a>
            </div>
          </div>

          {/* Hero mockup */}
          <div className="glass" style={{
            padding: 20, borderRadius: 20,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 80px rgba(79,142,247,0.05)",
          }}>
            <div style={{ background: "#0a0e18", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.04)" }}>
              {/* Fake interview room preview */}
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))", border: "2px solid rgba(79,142,247,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24 }}>🧑‍💼</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Alex</p>
                  <p style={{ fontSize: 11, color: "#34d399" }}>● Speaking...</p>
                </div>
              </div>
              <div style={{ background: "rgba(79,142,247,0.06)", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                "Tell me about a challenging project you worked on recently. What was your specific role?"
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(79,142,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(79,142,247,0.08)" }}>
                  <Mic size={18} color="#4f8ef7" />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Tap to speak</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section ref={statsRef} className="reveal" style={{
        padding: "40px 32px",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.01)"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[
            { value: 50000, suffix: "+", label: "Mock Interviews" },
            { value: 4.9, suffix: "★", label: "Average Rating", isDecimal: true },
            { value: 30, suffix: "+", label: "Question Phases" },
            { value: 95, suffix: "%", label: "More Confident" },
          ].map((stat, i) => (
            <div key={i}>
              <p style={{ fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg, #4f8ef7, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stat.isDecimal ? <>{stat.value}{stat.suffix}</> : <Counter end={stat.value} suffix={stat.suffix} />}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" ref={howRef} className="reveal" style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#4f8ef7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>How It Works</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "var(--text-primary)" }}>Three steps to interview mastery</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {STEPS.map((step, i) => (
              <div key={i} className="glass" style={{ padding: 32, textAlign: "center", position: "relative", transition: "transform 0.3s, border-color 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(79,142,247,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(167,139,250,0.15))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 18, fontWeight: 800, color: "#4f8ef7",
                  fontFamily: "var(--font-mono)"
                }}>{step.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" ref={featuresRef} className="reveal" style={{ padding: "100px 32px", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Features</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "var(--text-primary)" }}>Everything you need to ace your interview</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass" style={{ padding: 28, transition: "transform 0.3s, border-color 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(79,142,247,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(79,142,247,0.12), rgba(167,139,250,0.12))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16
                  }}>
                    <Icon size={20} color="#4f8ef7" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section ref={testimonialsRef} className="reveal" style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Testimonials</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "var(--text-primary)" }}>Trusted by thousands of candidates</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass" style={{ padding: 28, transition: "transform 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f8ef7, #a78bfa)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "white"
                  }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.role}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", gap: 2, marginTop: 12 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ============ FAQ ============ */}
      <section id="faq" ref={faqRef} className="reveal" style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "var(--text-primary)" }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="glass" style={{ overflow: "hidden", transition: "border-color 0.3s", borderColor: openFaq === i ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 24px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 600,
                    color: openFaq === i ? "#4f8ef7" : "var(--text-primary)",
                    textAlign: "left", transition: "color 0.2s"
                  }}
                >
                  {faq.q}
                  <ChevronDown size={18} style={{
                    color: "var(--text-muted)",
                    transition: "transform 0.3s",
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0
                  }} />
                </button>
                <div style={{
                  maxHeight: openFaq === i ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                  padding: openFaq === i ? "0 24px 18px" : "0 24px",
                }}>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section ref={ctaRef} className="reveal" style={{
        padding: "80px 32px",
        background: "linear-gradient(135deg, rgba(79,142,247,0.08), rgba(167,139,250,0.06))",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
          Ready to ace your next interview?
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
          Join thousands of candidates who improved their interview skills with AI-powered practice sessions.
        </p>
        <button className="btn btn-primary" onClick={onStartInterview} style={{ padding: "16px 40px", fontSize: 17 }}>
          Start Free Interview <ChevronRight size={20} />
        </button>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ padding: "60px 32px 32px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #4f8ef7, #7c6ff7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>A</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>InterviewAI</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 280 }}>
                The most realistic AI-powered mock interview simulator. Practice with confidence, get hired.
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>
                Built by <span style={{ color: "var(--accent)", fontWeight: 600 }}>Bhumit Goyal</span>
              </p>
            </div>
            {[
              { title: "Product", links: [{label: "Features", href: "#features"}, {label: "How It Works", href: "#how-it-works"}, {label: "FAQ", href: "#faq"}] },
              { title: "Resources", links: [{label: "Documentation", href: "#"}, {label: "Blog", href: "#"}, {label: "Support", href: "#"}] },
              { title: "Connect", links: [{label: "GitHub", href: "https://github.com/bhumitgoyal", icon: Github}, {label: "LinkedIn", href: "https://linkedin.com/in/bhumitgoyal", icon: Linkedin}, {label: "bhumitgoyal.bg@gmail.com", href: "mailto:bhumitgoyal.bg@gmail.com", icon: Mail}] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.title}</p>
                {col.links.map((link, li) => (
                  <p key={li} style={{ marginBottom: 8 }}>
                    <a href={link.href || "#"} target={link.href?.startsWith("http") ? "_blank" : undefined} rel={link.href?.startsWith("http") ? "noopener noreferrer" : undefined} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, transition: "color 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
                    >{link.icon && <link.icon size={14} />}{link.label}</a>
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>© 2025 InterviewAI. Built with 💙 by <a href="https://github.com/bhumitgoyal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Bhumit Goyal</a></p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="https://github.com/bhumitgoyal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              ><Github size={16} /></a>
              <a href="https://linkedin.com/in/bhumitgoyal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              ><Linkedin size={16} /></a>
              <a href="mailto:bhumitgoyal.bg@gmail.com" style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              ><Mail size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
