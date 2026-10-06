import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaCopy,
  FaVideo,
  FaShieldAlt,
} from "react-icons/fa";

function MeetingCreated() {
  const navigate = useNavigate();

  // =========================================================
  // GET MEETING DATA
  // =========================================================

  let meeting = null;

  try {
    const storedMeeting = localStorage.getItem("meeting");

    if (storedMeeting) {
      meeting = JSON.parse(storedMeeting);
    }
  } catch (error) {
    console.error(
      "❌ Failed to read meeting data:",
      error
    );
  }

  // =========================================================
  // GET MEETING ID
  // =========================================================

  const meetingId =
    meeting?.meetingId ||
    meeting?.meeting_id ||
    meeting?.id ||
    meeting?.code ||
    "N/A";

  // =========================================================
  // GET CANDIDATE MEETING LINK
  //
  // IMPORTANT:
  // This link is ONLY for the candidate.
  // The interviewer should NOT use this link to enter
  // the meeting.
  // =========================================================

  const meetingLink =
    meeting?.meetingLink ||
    meeting?.meeting_link ||
    (meetingId !== "N/A"
      ? `https://sublime-succulent-relenting.ngrok-free.dev/meeting/${meetingId}`
      : "");

  // =========================================================
  // COPY CANDIDATE LINK
  // =========================================================

  const copyLink = async () => {
    if (!meetingLink) {
      alert("Meeting link is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        meetingLink
      );

      alert("Meeting link copied!");
    } catch (error) {
      console.error(
        "❌ Copy failed:",
        error
      );

      alert(
        "Unable to copy the meeting link."
      );
    }
  };

  // =========================================================
  // MEETING DATA NOT FOUND
  // =========================================================

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-center p-8">

        <div className="bg-slate-800 rounded-2xl p-10 text-center shadow-xl max-w-lg">

          <h1 className="text-3xl font-bold mb-4">
            Meeting Information Not Found
          </h1>

          <p className="text-gray-300 mb-6">
            The meeting information could not be loaded.
          </p>

          <button
            onClick={() =>
              navigate("/generate-meeting")
            }
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            Create New Meeting
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-8">

      <div className="max-w-5xl mx-auto">

        {/* =================================================
            SUCCESS HEADER
        ================================================= */}

        <div className="bg-slate-800 rounded-2xl p-10 shadow-xl text-center">

          <FaCheckCircle
            className="text-green-400 mx-auto mb-5"
            size={70}
          />

          <h1 className="text-4xl font-bold">
            Meeting Created Successfully
          </h1>

          <p className="text-gray-300 mt-3">
            Your secure TRUSTCall AI meeting has
            been created successfully.
            The meeting invitation has been sent
            to the candidate's email.
          </p>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid lg:grid-cols-2 gap-8 mt-10">

          {/* =================================================
              MEETING DETAILS
          ================================================= */}

          <div className="bg-slate-800 rounded-xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Meeting Details
            </h2>

            <div className="space-y-5">

              {/* TITLE */}

              <div>
                <p className="text-gray-400 text-sm">
                  Meeting Title
                </p>

                <h3 className="text-xl font-semibold">
                  {meeting?.title || "N/A"}
                </h3>
              </div>


              {/* MEETING ID */}

              <div>
                <p className="text-gray-400 text-sm">
                  Meeting ID
                </p>

                <h3 className="font-mono text-lg text-blue-300">
                  {meetingId}
                </h3>
              </div>


              {/* INTERVIEWER */}

              <div>
                <p className="text-gray-400 text-sm">
                  Interviewer
                </p>

                <h3 className="text-lg">
                  {meeting?.interviewer || "N/A"}
                </h3>
              </div>


              {/* CANDIDATE EMAIL */}

              <div>
                <p className="text-gray-400 text-sm">
                  Candidate Email
                </p>

                <h3 className="text-lg break-all">
                  {meeting?.email || "N/A"}
                </h3>
              </div>


              {/* DATE + TIME */}

              <div className="grid grid-cols-2 gap-5">

                <div>
                  <p className="text-gray-400 text-sm">
                    Date
                  </p>

                  <h3>
                    {meeting?.date || "N/A"}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">
                    Time
                  </p>

                  <h3>
                    {meeting?.time || "N/A"}
                  </h3>
                </div>

              </div>


              {/* DURATION + TYPE */}

              <div className="grid grid-cols-2 gap-5">

                <div>
                  <p className="text-gray-400 text-sm">
                    Duration
                  </p>

                  <h3>
                    {meeting?.duration || "N/A"}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">
                    Interview Type
                  </p>

                  <h3>
                    {meeting?.type || "N/A"}
                  </h3>
                </div>

              </div>


              {/* AI MONITORING */}

              <div className="flex items-center gap-2 text-green-400 font-semibold">

                <FaShieldAlt />

                AI Monitoring Enabled

              </div>

            </div>

          </div>


          {/* =================================================
              CANDIDATE SECURE LINK
          ================================================= */}

          <div className="bg-slate-800 rounded-xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Candidate Meeting Link
            </h2>

            <div className="bg-slate-700 rounded-lg p-4 break-all min-h-[56px]">

              {meetingLink ? (

                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  {meetingLink}
                </a>

              ) : (

                <span className="text-gray-400">
                  Meeting link is not available.
                </span>

              )}

            </div>


            <button
              onClick={copyLink}
              disabled={!meetingLink}
              className={`mt-5 w-full py-3 rounded-lg flex justify-center items-center gap-2 ${
                meetingLink
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >

              <FaCopy />

              Copy Candidate Link

            </button>

          </div>

        </div>


        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="flex justify-center gap-5 mt-10 flex-wrap">

          {/* GENERATE ANOTHER MEETING */}

          <button
            onClick={() =>
              navigate("/generate-meeting")
            }
            className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Generate Another Meeting
          </button>


          {/* =================================================
              INTERVIEWER BUTTON

              IMPORTANT:
              This MUST go to:

              /interviewer-meeting/:meetingId

              NOT:

              /meeting/:meetingId
              /meeting-room/:meetingId
              /device-setup/:meetingId
          ================================================= */}

          <button
            onClick={() => {

              if (meetingId !== "N/A") {

                console.log(
                  "🎤 Launching interviewer meeting:",
                  meetingId
                );

                // Explicitly set interviewer role
                localStorage.setItem(
                  "role",
                  "Interviewer"
                );

                sessionStorage.setItem(
                  "role",
                  "Interviewer"
                );

                // Store meeting ID
                localStorage.setItem(
                  "pendingMeetingId",
                  meetingId
                );

                sessionStorage.setItem(
                  "pendingMeetingId",
                  meetingId
                );

                console.log(
                  "👤 Interviewer role stored"
                );

                // Go to interviewer meeting
                navigate(
                  `/interviewer-meeting/${meetingId}`
                );

              } else {

                alert(
                  "Meeting ID is not available."
                );

              }

            }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-105 transition flex items-center gap-2"
          >

            <FaVideo />

            Launch Interviewer Meeting

          </button>

        </div>


        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="mt-8 text-center text-gray-400 text-sm">

          <p>
            The candidate should use the emailed
            meeting link.
          </p>

          <p className="mt-1">
            You should use the{" "}
            <span className="text-purple-300 font-semibold">
              Launch Interviewer Meeting
            </span>{" "}
            button above.
          </p>

        </div>

      </div>

    </div>
  );
}

export default MeetingCreated;