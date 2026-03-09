import { useState } from "react";
import LandingPage from "./components/LandingPage";
import SetupScreen from "./components/SetupScreen";
import InterviewRoom from "./components/InterviewRoom";
import SummaryScreen from "./components/SummaryScreen";

export default function App() {
  const [screen, setScreen] = useState("landing"); // "landing" | "setup" | "interview" | "summary"
  const [sessionData, setSessionData] = useState(null);
  const [summaryReport, setSummaryReport] = useState(null);

  const handleStartInterview = () => {
    setScreen("setup");
  };

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
    setScreen("landing");
  };

  if (screen === "landing") {
    return <LandingPage onStartInterview={handleStartInterview} />;
  }

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
