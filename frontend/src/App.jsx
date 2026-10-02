import { useState } from "react";
import Interviewer from "./pages/Interviewer";
import Candidate from "./pages/Candidate";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const meetingFromUrl = params.get("meeting") || "";

  const [role, setRole] = useState(
    meetingFromUrl ? "candidate" : null
  );

  if (role === "interviewer") {
    return (
      <Interviewer
        onBack={() => setRole(null)}
      />
    );
  }

  if (role === "candidate") {
    return (
      <Candidate
        initialMeetingId={meetingFromUrl}
        onBack={() => setRole(null)}
      />
    );
  }

  return (
    <div className="landing-page">

      <div className="landing-card">

        <div className="landing-logo">
          ◆
        </div>

        <div className="landing-brand">
          TRUSTCall <span>AI</span>
        </div>

        <h1>Trusted Communication for Online Interviews</h1>

        <p>
          Secure browser-based interviews with real-time
          communication and AI-powered authenticity monitoring.
        </p>

        <div className="role-buttons">

          <button
            className="role-button primary-role"
            onClick={() => setRole("interviewer")}
          >
            <strong>Interviewer</strong>
            <small>Create and manage an interview</small>
          </button>

          <button
            className="role-button"
            onClick={() => setRole("candidate")}
          >
            <strong>Candidate</strong>
            <small>Join an interview using a Meeting ID</small>
          </button>

        </div>

        <div className="landing-security">
          🔒 End-to-End Encrypted &nbsp; • &nbsp; WebRTC Communication
        </div>

      </div>

    </div>
  );
}
