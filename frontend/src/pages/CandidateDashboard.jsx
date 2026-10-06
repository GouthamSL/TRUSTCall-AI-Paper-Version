import CandidateNavbar from "../components/candidate/CandidateNavbar";
import WelcomeSection from "../components/candidate/WelcomeSection";
import CameraPreview from "../components/candidate/CameraPreview";
import MeetingInfo from "../components/candidate/MeetingInfo";
import DeviceSettings from "../components/candidate/DeviceSettings";
import MeetingChecklist from "../components/candidate/MeetingChecklist";
import InterviewTips from "../components/candidate/InterviewTips";

import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

function CandidateDashboard() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  /*
  =========================================================
  MEETING ID
  =========================================================

  When candidate clicks the email:

  /meeting/46B5A5D7

  App.jsx sends the candidate here:

  /candidate/dashboard?meetingId=46B5A5D7

  We retrieve that meeting ID here.
  */

  const meetingIdFromUrl =
    searchParams.get("meetingId");

  const [meetingCode, setMeetingCode] =
    useState(
      meetingIdFromUrl ||
      localStorage.getItem("pendingMeetingId") ||
      sessionStorage.getItem("pendingMeetingId") ||
      ""
    );

  /*
  =========================================================
  INITIALIZE CANDIDATE MEETING
  =========================================================
  */

  useEffect(() => {
    if (meetingIdFromUrl) {
      console.log(
        "📩 Meeting ID received from email:",
        meetingIdFromUrl
      );

      setMeetingCode(meetingIdFromUrl);

      // Save for the rest of the candidate flow
      localStorage.setItem(
        "pendingMeetingId",
        meetingIdFromUrl
      );

      sessionStorage.setItem(
        "pendingMeetingId",
        meetingIdFromUrl
      );

      // Candidate role
      localStorage.setItem(
        "role",
        "Candidate"
      );

      sessionStorage.setItem(
        "role",
        "Candidate"
      );
    }
  }, [meetingIdFromUrl]);

  /*
  =========================================================
  JOIN MEETING
  =========================================================
  */

  const handleJoinMeeting = () => {
    const code = meetingCode.trim();

    if (!code) {
      alert("Meeting ID is missing.");
      return;
    }

    console.log(
      "🚀 Candidate joining meeting:",
      code
    );

    // Save meeting ID
    localStorage.setItem(
      "pendingMeetingId",
      code
    );

    sessionStorage.setItem(
      "pendingMeetingId",
      code
    );

    // Save Candidate role
    localStorage.setItem(
      "role",
      "Candidate"
    );

    sessionStorage.setItem(
      "role",
      "Candidate"
    );

    /*
    ---------------------------------------------------------
    IMPORTANT

    Do NOT enter MeetingRoom yet.

    First go to Device Setup so the candidate can select:

    - Integrated Webcam
    - OBS Virtual Camera
    - Other camera

    This is required for your deepfake demonstration.
    ---------------------------------------------------------
    */

    navigate(
      `/device-setup/${encodeURIComponent(code)}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <CandidateNavbar />


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="max-w-[1700px] mx-auto px-5 py-3">

        {/* =================================================
            WELCOME
        ================================================= */}

        <WelcomeSection />


        {/* =================================================
            JOIN INTERVIEW
        ================================================= */}

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

          <h2 className="text-xl font-semibold text-white mb-4">
            Join Your Interview
          </h2>

          <label className="text-gray-400">
            Meeting Code
          </label>

          <input
            type="text"
            placeholder="Meeting ID"
            value={meetingCode}
            onChange={(e) =>
              setMeetingCode(e.target.value)
            }
            className="w-full mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-cyan-500"
          />

          {meetingIdFromUrl && (
            <p className="text-green-400 text-sm mt-2">
              ✓ Meeting invitation detected
            </p>
          )}

        </div>


        {/* =================================================
            CAMERA PREVIEW + RIGHT PANEL
        ================================================= */}

        <div className="grid grid-cols-3 gap-5 mt-4">

          {/* LEFT SIDE */}

          <div className="col-span-2">
            <CameraPreview />
          </div>


          {/* RIGHT SIDE */}

          <div className="space-y-6">

            <MeetingInfo />

            <DeviceSettings />

          </div>

        </div>


        {/* =================================================
            CHECKLIST + TIPS
        ================================================= */}

        <div className="grid grid-cols-3 gap-5 mt-4">

          {/* MEETING CHECKLIST */}

          <div className="col-span-2">

            <MeetingChecklist />

          </div>


          {/* INTERVIEW TIPS */}

          <div>

            <InterviewTips />

          </div>

        </div>


        {/* =================================================
            JOIN SECURE MEETING
        ================================================= */}

        <button
          onClick={handleJoinMeeting}
          className="w-full mt-6 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
        >
          Join Secure Meeting
        </button>

      </div>

    </div>
  );
}

export default CandidateDashboard;