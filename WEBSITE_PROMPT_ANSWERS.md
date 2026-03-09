Build me a beautiful, complete, single-page website.

**What it's for:** > A landing page for **InterviewAI** — an AI-powered mock interview simulator SaaS product. Users upload their resume (PDF), paste a job description, and enter a live, voice-based mock interview with "Alex," an AI interviewer powered by GPT-4o. The app transcribes speech (Whisper), generates TTS audio responses, tracks interview phases (greeting → resume deep-dive → technical → DSA → behavioral → closing), detects hesitation, and produces a detailed performance report with scores, strengths, weaknesses, and ideal answers. It targets job seekers, developers, and professionals preparing for technical interviews at top-tier tech companies.
 ( InterviewAI is a software-as-a-service product — a web application that users interact with in-browser. It leverages OpenAI APIs (GPT-4o, Whisper, TTS) on the backend and offers a real-time interview experience via WebSockets.)
**Type of business:**  InterviewAI is a software-as-a-service product — a web application that users interact with in-browser. It leverages OpenAI APIs (GPT-4o, Whisper, TTS) on the backend and offers a real-time interview experience via WebSockets.
**Main button text:** " **"Start Free Interview"**  Alternative options: - "Try a Mock Interview" - "Practice Now — It's Free" - "Start Practicing" - "Begin Your Interview""

Design style: Bold and high-impact. Dark background with strong accent colors. Big typography, confident layout, striking contrast. Feels like a tech startup that means business. Think Vercel or Stripe.

Pick a color palette that feels right for this type of business. Don't overthink it — just choose colors that look great together and fit the vibe.

**Page sections (build them in this order):**
1. Hero — Big bold headline (8 words max), one-line description underneath, and a prominent call-to-action button. Add an image, mockup, or illustration on the right side.
2. Social proof — A row of 4-6 recognizable logos with a "Trusted by" label. Keep it compact and credible.
3. Features — A grid of 3-6 benefit cards. Each has an icon, short title, and one-sentence description. Focus on what the customer gets, not technical features.
4. Footer — Logo, navigation links in columns, social media icons, and copyright text. Clean and organized.
5. How it works — 3 simple numbered steps showing the customer journey. Each step has a title and short description. Connect them visually.
6. FAQ — 5-6 common questions in an expandable accordion. Practical, real questions that this niche would actually get.

**Important:**
- Make it fully responsive (looks great on phone and desktop)
- Use real, realistic placeholder text — not lorem ipsum. Write copy that actually fits this business.
- Add smooth, subtle animations (fade in on scroll, hover effects on buttons and cards)
- The call-to-action button should appear above the fold and repeat near the bottom
- Keep the code clean and production-ready. Single page, no routing.
- Use React with Tailwind CSS# Website Prompt Builder — Answers for AI Mock Interview Simulator

Use these answers to fill in the [prompt builder website](https://jackroberts.dev) and generate a ready-to-paste frontend prompt.

---

## 1. What's the website for?

> A landing page for **InterviewAI** — an AI-powered mock interview simulator SaaS product. Users upload their resume (PDF), paste a job description, and enter a live, voice-based mock interview with "Alex," an AI interviewer powered by GPT-4o. The app transcribes speech (Whisper), generates TTS audio responses, tracks interview phases (greeting → resume deep-dive → technical → DSA → behavioral → closing), detects hesitation, and produces a detailed performance report with scores, strengths, weaknesses, and ideal answers. It targets job seekers, developers, and professionals preparing for technical interviews at top-tier tech companies.

---

## 2. What type of business?

> **SaaS Product**

InterviewAI is a software-as-a-service product — a web application that users interact with in-browser. It leverages OpenAI APIs (GPT-4o, Whisper, TTS) on the backend and offers a real-time interview experience via WebSockets.

---

## 3. Pick a style

> **Bold & Dark**

The existing frontend design spec uses:
- Near-black background: `#080c14`
- Electric blue accent: `#4f8ef7`
- Soft violet secondary: `#a78bfa`
- Glassmorphism cards with `backdrop-filter: blur(12px)`
- Premium dark mode aesthetic with strong contrast
- Think **Vercel** or **Stripe** — cinematic, high-impact, tech-forward

---

## 4. Build your page — Sections (in order)

### Recommended section lineup:

| # | Section | What to include |
|---|---------|----------------|
| 1 | **Hero** | Bold headline (e.g. "Practice Like It's Real"), tagline about AI-powered mock interviews, CTA button, and a mockup/screenshot of the interview room UI |
| 2 | **Social Proof / Stats** | Key metrics: e.g. "50,000+ mock interviews completed", "4.9★ average rating", "30+ interview phases covered", "95% of users felt more confident" |
| 3 | **How It Works** | 3-step flow: (1) Upload Resume & Paste JD → (2) Live Interview with Alex (voice + camera) → (3) Get Detailed Performance Report |
| 4 | **Features** | Grid of 4-6 benefit cards showcasing key capabilities |
| 5 | **Testimonials** | 3-4 testimonial cards from mock users (developers, career switchers, bootcamp grads) |
| 6 | **FAQ** | 5-6 common questions about how the AI works, privacy, report accuracy, etc. |
| 7 | **CTA Banner** | Final call-to-action section before footer to drive conversions |
| 8 | **Footer** | Logo, nav links, social icons, copyright |

### Feature cards content (for the Features section):

| Icon | Title | Description |
|------|-------|-------------|
| 🎙️ | **Voice-Powered Interviews** | Speak naturally — your answers are transcribed in real-time with OpenAI Whisper and responded to by your AI interviewer, Alex. |
| 📄 | **Resume-Aware Questions** | Alex reads your actual resume and drills into your specific projects, tech stack, and experience — just like a real interviewer. |
| 🧠 | **Adaptive Interview Phases** | The interview follows a structured 7-phase flow — from greeting to technical deep-dives to behavioral questions — covering 20-30 questions. |
| 📊 | **Detailed Performance Report** | Get scored on technical depth, communication, and confidence. See your strengths, weaknesses, hesitation moments, and ideal answers side by side. |
| ⚡ | **Real-Time AI Responses** | Alex responds instantly with natural voice via TTS. No waiting, no awkward pauses — it feels like a real conversation. |
| 🔒 | **Private & Secure** | Your resume and responses are processed in-session only. Nothing is stored permanently — your data stays yours. |

### How It Works content:

| Step | Title | Description |
|------|-------|-------------|
| 1 | **Upload & Set Up** | Upload your PDF resume and paste the job description you're preparing for. InterviewAI analyzes both to tailor your interview. |
| 2 | **Interview with Alex** | Enter a live interview room with your AI interviewer. Speak into your mic, see yourself on camera, and watch Alex respond with voice and subtitles in real-time. |
| 3 | **Get Your Report** | After ~25 questions, receive a comprehensive performance report with scores out of 100, strengths and weaknesses, and suggested ideal answers for every question you struggled on. |

### FAQ content:

| Question | Answer |
|----------|--------|
| How realistic is the AI interviewer? | Alex is powered by GPT-4o and follows the exact structure of a real technical interview — greeting, resume deep-dive, technical questions, behavioral, and closing. It probes vague answers and adapts based on your resume. |
| What do I need to get started? | Just a PDF resume, a job description, and a browser with mic/camera access. No downloads required. |
| How long does an interview take? | A typical session covers 20-30 questions and lasts about 25-40 minutes, similar to a real first-round interview. |
| Is my data stored? | No. Sessions are held in-memory and automatically cleaned up. Your resume and answers are not persisted. |
| What's in the performance report? | You get an overall score (0-100), technical/communication/confidence sub-scores, a list of strengths and weaknesses, hesitation detection analysis, and ideal answers for questions you underperformed on. |
| Can I use this for non-technical roles? | While the system excels at technical interviews (SWE, backend, full-stack), it adapts to any job description you provide — including PM, marketing, and leadership roles. |

---

## 5. What should the button say?

> **"Start Free Interview"**

Alternative options:
- "Try a Mock Interview"
- "Practice Now — It's Free"
- "Start Practicing"
- "Begin Your Interview"

---

## Generated Prompt (ready to paste)

Copy the below prompt directly into Lovable, Bolt, AntiGravity AI Studio, v0, or any AI builder:

---

```
Build me a beautiful, complete, single-page website.

**What it's for:** A landing page for InterviewAI — an AI-powered mock interview simulator where users upload their resume, paste a job description, and do a live voice-based mock interview with an AI interviewer named Alex. It uses GPT-4o for questions, Whisper for speech-to-text, and TTS for voice responses. After ~25 questions, users get a detailed performance report with scores, strengths, weaknesses, and ideal answers. (SaaS Product)

**Type of business:** SaaS Product
**Main button text:** "Start Free Interview"

Design style: Bold and high-impact. Dark background (#080c14) with electric blue (#4f8ef7) and soft violet (#a78bfa) accents. Big typography, confident layout, striking contrast. Glassmorphism cards with backdrop-blur. Feels like a tech startup that means business. Think Vercel or Stripe.

Pick a color palette that feels right for this type of business. Don't overthink it — just choose colors that look great together and fit the vibe.

**Page sections (build them in this order):**
1. Hero — Big bold headline "Practice Like It's Real", subtitle "Upload your resume. Face a real AI interviewer. Get scored.", prominent "Start Free Interview" button. Add a mockup or screenshot of a dark interview room UI on the right side showing an avatar, captions, and a record button.
2. Social proof / Stats — A row of 4 stat counters: "50,000+ Interviews", "4.9★ Rating", "30+ Question Phases", "95% More Confident". Sleek, compact, credible.
3. How It Works — 3-step horizontal flow: (1) Upload Resume & Paste JD, (2) Live Interview with Alex, (3) Get Your Performance Report. Each step has an icon, title, and one-sentence description.
4. Features — A grid of 6 benefit cards: Voice-Powered Interviews, Resume-Aware Questions, Adaptive Interview Phases, Detailed Performance Report, Real-Time AI Responses, Private & Secure. Each card has an icon/emoji, short title, and one-sentence description focused on what the user gets.
5. Testimonials — 3 testimonial cards with realistic quotes from developers preparing for FAANG interviews, career switchers from bootcamps, and engineering managers.
6. FAQ — 6 collapsible accordion items covering: how realistic is the AI, what you need to start, how long interviews take, data privacy, what's in the report, and non-technical role support.
7. CTA Banner — Full-width dark gradient banner with "Ready to ace your next interview?" headline and a large "Start Free Interview" button.
8. Footer — InterviewAI logo, navigation links in columns (Product, Resources, Company), social media icons, and "© 2025 InterviewAI. All rights reserved."

**Important:**
- Make it fully responsive (looks great on phone and desktop)
- Use real, realistic placeholder text — not lorem ipsum. Write copy that actually fits an AI interview prep SaaS.
- Add smooth, subtle animations (fade in on scroll, hover effects on buttons and cards, counting animations on stats)
- The call-to-action button should appear above the fold and repeat near the bottom
- Keep the code clean and production-ready. Single page, no routing.
- Use React with Tailwind CSS
- Use Sora font from Google Fonts for the UI and JetBrains Mono for any mono/code-style text
```

---

## Backend Context (for reference)

The backend is already built with:

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI (Python 3.11+) |
| LLM | OpenAI GPT-4o |
| STT | OpenAI Whisper API |
| TTS | OpenAI TTS (`tts-1`, voice: `onyx`) |
| PDF Parsing | `pdfplumber` |
| Sessions | In-memory dict (UUID-keyed) |
| Realtime | WebSocket endpoint |
| CORS | All origins allowed (dev) |

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/session/start` | Upload PDF resume + JD → get session ID + first message |
| `POST` | `/api/interview/respond` | Submit text answer → get next question + TTS audio |
| `POST` | `/api/interview/transcribe` | Upload audio blob → get transcript |
| `POST` | `/api/interview/summary` | Get full evaluation report (scores, feedback, ideal answers) |
| `GET` | `/api/session/{id}/status` | Check session phase and progress |
| `WS` | `/ws/interview/{id}` | Real-time audio streaming mode |

### Interview Phases

`Greeting` → `Introduction` → `Resume Deep Dive` → `Technical` → `DSA` (if applicable) → `Behavioral` → `Closing` → `Summary`

### Report Output Fields

`overall_score`, `technical_score`, `communication_score`, `confidence_score`, `strengths`, `weaknesses`, `hesitation_moments`, `better_answers`, `final_verdict`, `detailed_feedback`
