import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUserTie, FaUser, FaCheckCircle } from "react-icons/fa";

import RoleHeader from "../components/role/RoleHeader";
import RoleCard from "../components/role/RoleCard";
import SecurityBanner from "../components/role/SecurityBanner";

function RoleSelection() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 px-6 py-6">

      {/* Header */}
      <RoleHeader />

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white">
          TRUSTCall AI
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {/* Role Cards */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-center gap-10 mt-12">

        {/* Interviewer Card */}
        <RoleCard
          icon={<FaUserTie size={45} />}
          title="Interviewer / Client"
          description="Create meetings, invite candidates, and monitor AI-powered interview analysis."
          features={[
            "Create & Manage Meetings",
            "Generate Meeting Links",
            "Real-Time AI Monitoring",
            "Trust Score Dashboard",
            "Meeting Analytics",
          ]}
          featureIcon={<FaCheckCircle />}
          buttonText="Continue as Interviewer"
          buttonColor="from-purple-700 to-fuchsia-500"
          onClick={() => {
            sessionStorage.setItem("role", "Interviewer");
            navigate("/generate-meeting");
          }}
        />

        {/* Candidate Card */}
        <RoleCard
          icon={<FaUser size={45} />}
          title="Candidate / User"
          description="Join interview meetings securely and communicate through encrypted WebRTC."
          features={[
            "Join Meeting with Link",
            "Camera Preview",
            "Microphone Check",
            "Secure Communication",
            "Easy Interview Access",
          ]}
          featureIcon={<FaCheckCircle />}
          buttonText="Continue as Candidate"
          buttonColor="from-blue-600 to-cyan-500"
          onClick={() => {
            sessionStorage.setItem("role", "Candidate");
            navigate("/candidate/dashboard");
          }}
        />

      </div>

      {/* Bottom Security Banner */}
      <SecurityBanner />

    </div>
  );
}

export default RoleSelection;