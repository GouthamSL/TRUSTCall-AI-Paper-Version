import { useNavigate } from "react-router-dom";
import { FaVideo, FaArrowLeft, FaShieldAlt } from "react-icons/fa";

function StartMeeting() {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate("/interviewer-meeting");
  };

  const handleBack = () => {
    navigate("/meeting-created");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-6">

      <div className="w-full max-w-2xl bg-slate-800 rounded-3xl shadow-2xl p-10 text-center">

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center">
            <FaVideo size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Ready to Start Interview
        </h1>

        <p className="text-gray-300 mb-8">
          Your secure TRUSTCall AI meeting has been created successfully.
          When you are ready, click the button below to begin the interview.
        </p>

        <div className="bg-slate-700 rounded-xl p-6 mb-8">

          <div className="flex justify-between py-2">
            <span className="text-gray-400">Meeting ID</span>
            <span className="text-white font-semibold">
              TC-2027-845621
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-400">Security</span>
            <span className="text-green-400 flex items-center gap-2">
              <FaShieldAlt />
              AI Protected
            </span>
          </div>

        </div>

        <div className="flex justify-center gap-4">

          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            onClick={handleStartInterview}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-105 transition text-white flex items-center gap-2"
          >
            <FaVideo />
            Start Interview
          </button>

        </div>

      </div>

    </div>
  );
}

export default StartMeeting;