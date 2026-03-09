# InterviewAI - AI-Powered Mock Interview Simulator

InterviewAI is a software-as-a-service (SaaS) web application that provides realistic, AI-driven mock interviews. Users can upload their resume (PDF), paste a job description, and engage in a live, voice-based mock interview with "Alex," an AI interviewer powered by GPT-4o. 

The application uses OpenAI Whisper for real-time speech transcription, GPT-4o to dynamically generate interview questions, and OpenAI TTS for human-like voice responses. After each session, the system produces a comprehensive performance report detailing scores, strengths, weaknesses, hesitation detection, and ideal answers.

## Features

- **Voice-Powered Interviews**: Real-time speech-to-text with OpenAI Whisper and text-to-speech with OpenAI TTS. Feels like a live conversation.
- **Resume-Aware Questions**: Connects your uploaded resume and the specific job description to dynamically generate highly relevant questions.
- **Adaptive Interview Phases**: Follows a standard structured flow: Greeting → Introduction → Resume Deep Dive → Technical → DSA (if applicable) → Behavioral → Closing.
- **Detailed Performance Report**: Get scored on technical depth, communication, and confidence. Includes areas of improvement and ideal answers side-by-side.
- **Real-Time AI Responses**: Fast, natural back-and-forth communication.
- **Private & Secure**: In-memory sessions; your data is not stored long-term.

## Tech Stack

### Frontend
- **Framework**: React / Vite
- **Styling**: Tailwind CSS
- **Features**: Real-time WebSockets for audio streaming, MediaRecorder API

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI Integrations**: OpenAI GPT-4o, Whisper API, TTS
- **PDF Parsing**: `pdfplumber`

## Project Structure

- `/frontend` - Contains the React single-page application.
- `/backend` - Contains the FastAPI service.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- An OpenAI API Key

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`:
   ```bash
   cp .env.example .env
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## License

© 2026 InterviewAI. All rights reserved.
