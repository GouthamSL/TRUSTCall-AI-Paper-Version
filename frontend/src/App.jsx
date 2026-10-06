import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import RoleSelection from "./pages/RoleSelection";
import CandidateDashboard from "./pages/CandidateDashboard";

import GenerateMeeting from "./pages/GenerateMeeting";
import MeetingCreated from "./pages/MeetingCreated";
import DeviceSetup from "./pages/DeviceSetup";
import MeetingRoom from "./pages/MeetingRoom";
import MeetingEnded from "./pages/MeetingEnded";

import StartMeeting from "./pages/StartMeeting";
import InterviewerMeetingRoom from "./pages/InterviewerMeetingRoom";

/*
=========================================================
CANDIDATE MEETING ENTRY
=========================================================

When the candidate clicks the meeting link from email:

/meeting/:meetingId

we:

1. Save the meeting ID
2. Mark the user as Candidate
3. Send the candidate to Candidate Dashboard

This route is ONLY for candidates.
*/

function CandidateMeetingEntry() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) {
      console.error("❌ No meeting ID found");

      navigate("/candidate/dashboard", {
        replace: true,
      });

      return;
    }

    console.log(
      "📩 Candidate opened meeting link:",
      meetingId
    );

    // -------------------------------------------------
    // Store meeting ID
    // -------------------------------------------------

    localStorage.setItem(
      "pendingMeetingId",
      meetingId
    );

    sessionStorage.setItem(
      "pendingMeetingId",
      meetingId
    );

    // -------------------------------------------------
    // Candidate email links are ALWAYS Candidate
    // -------------------------------------------------

    localStorage.setItem(
      "role",
      "Candidate"
    );

    sessionStorage.setItem(
      "role",
      "Candidate"
    );

    console.log(
      "👤 Candidate role stored"
    );

    console.log(
      "🆔 Pending Meeting ID:",
      meetingId
    );

    // -------------------------------------------------
    // Go to Candidate Dashboard
    // -------------------------------------------------

    navigate(
      `/candidate/dashboard?meetingId=${encodeURIComponent(
        meetingId
      )}`,
      {
        replace: true,
      }
    );
  }, [meetingId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-white">
      <div className="text-center">

        <div className="text-2xl font-bold mb-3">
          TRUSTCall AI
        </div>

        <div className="text-gray-300">
          Preparing your interview...
        </div>

      </div>
    </div>
  );
}


/*
=========================================================
INTERVIEWER MEETING ENTRY
=========================================================

The interviewer uses:

/interviewer-meeting/:meetingId

This route explicitly establishes the Interviewer role
so stale Candidate storage cannot affect the interviewer.
*/

function InterviewerMeetingEntry() {
  const { meetingId } = useParams();

  useEffect(() => {
    if (!meetingId) {
      console.error(
        "❌ No interviewer meeting ID found"
      );

      return;
    }

    // -------------------------------------------------
    // Explicitly establish Interviewer role
    // -------------------------------------------------

    localStorage.setItem(
      "role",
      "Interviewer"
    );

    sessionStorage.setItem(
      "role",
      "Interviewer"
    );

    // -------------------------------------------------
    // Store meeting ID
    // -------------------------------------------------

    localStorage.setItem(
      "pendingMeetingId",
      meetingId
    );

    sessionStorage.setItem(
      "pendingMeetingId",
      meetingId
    );

    console.log(
      "🎤 Interviewer opened meeting:",
      meetingId
    );

    console.log(
      "👤 Interviewer role stored"
    );

  }, [meetingId]);

  return (
    <InterviewerMeetingRoom />
  );
}


/*
=========================================================
MAIN APP
=========================================================
*/

function App() {
  return (
    <Router>

      <Routes>

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* =================================================
            ROLE SELECTION
        ================================================= */}

        <Route
          path="/select-role"
          element={<RoleSelection />}
        />


        {/* =================================================
            CANDIDATE DASHBOARD
        ================================================= */}

        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />


        {/* =================================================
            INTERVIEWER
        ================================================= */}

        <Route
          path="/generate-meeting"
          element={<GenerateMeeting />}
        />

        <Route
          path="/meeting-created"
          element={<MeetingCreated />}
        />

        <Route
          path="/start-meeting"
          element={<StartMeeting />}
        />


        {/* =================================================
            INTERVIEWER MEETING
        ================================================= */}

        <Route
          path="/interviewer-meeting/:meetingId"
          element={<InterviewerMeetingEntry />}
        />

        {/* Compatibility route */}

        <Route
          path="/interviewer-meeting"
          element={<InterviewerMeetingRoom />}
        />


        {/* =================================================
            DEVICE SETUP
        ================================================= */}

        <Route
          path="/device-setup/:meetingId"
          element={<DeviceSetup />}
        />


        {/* =================================================
            CANDIDATE EMAIL MEETING LINK
        ================================================= */}

        <Route
          path="/meeting/:meetingId"
          element={<CandidateMeetingEntry />}
        />


        {/* =================================================
            ACTUAL CANDIDATE MEETING ROOM
        ================================================= */}

        <Route
          path="/meeting-room/:meetingId"
          element={<MeetingRoom />}
        />


        {/* =================================================
            MEETING END
        ================================================= */}

        <Route
          path="/meeting-ended"
          element={<MeetingEnded />}
        />

      </Routes>

    </Router>
  );
}

export default App;