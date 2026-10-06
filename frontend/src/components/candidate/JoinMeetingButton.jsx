import { FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function JoinMeetingButton() {
  const navigate = useNavigate();

  return (
    <div className="w-full">

      <button
        onClick={() => navigate("/meeting")}
        className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-3 rounded-2xl text-xl font-semibold flex justify-center items-center gap-4 shadow-lg hover:opacity-90"
      >
        <FaVideo />
        Join Meeting
      </button>

      <p className="text-center text-gray-500 mt-4">
        🔒 Your connection is secure and encrypted
      </p>

    </div>
  );
}

export default JoinMeetingButton;