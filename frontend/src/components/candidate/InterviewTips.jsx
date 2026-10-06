import { FaLightbulb } from "react-icons/fa";

function InterviewTips() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-full">

      <div className="flex items-center gap-3 mb-5">
        <FaLightbulb className="text-purple-600 text-xl" />
        <h2 className="text-2xl font-semibold">
          Tips for a Great Interview
        </h2>
      </div>

      <ul className="space-y-2 text-gray-700">
        <li>💡 Ensure good lighting on your face</li>
        <li>🔇 Stay in a quiet environment</li>
        <li>👀 Look at the camera while speaking</li>
        <li>📄 Keep your resume handy</li>
      </ul>

    </div>
  );
}

export default InterviewTips;