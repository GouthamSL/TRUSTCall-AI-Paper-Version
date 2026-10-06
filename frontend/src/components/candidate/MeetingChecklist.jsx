import { FaClipboardCheck, FaCheckCircle } from "react-icons/fa";

function MeetingChecklist() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-full">

      <div className="flex items-center gap-3 mb-6">
        <FaClipboardCheck className="text-purple-600 text-xl" />
        <h2 className="text-2xl font-semibold">
          Meeting Checklist
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-500 text-2xl" />
          <div>
            <p className="font-semibold">Camera</p>
            <p className="text-gray-500 text-sm">
              Detected and Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-500 text-2xl" />
          <div>
            <p className="font-semibold">Microphone</p>
            <p className="text-gray-500 text-sm">
              Detected and Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-500 text-2xl" />
          <div>
            <p className="font-semibold">Internet</p>
            <p className="text-gray-500 text-sm">
              Stable Connection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-500 text-2xl" />
          <div>
            <p className="font-semibold">Browser</p>
            <p className="text-gray-500 text-sm">
              Supported
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default MeetingChecklist;