import { FaInfoCircle } from "react-icons/fa";

function MeetingInfo() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4">

      <div className="flex items-center gap-3 mb-6">
        <FaInfoCircle className="text-purple-600 text-xl" />
        <h2 className="text-2xl font-semibold">
          Meeting Information
        </h2>
      </div>

      <div className="space-y-3">

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">Meeting ID</span>
          <span className="font-semibold text-purple-600">
            TC-8453AB
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">Interviewer</span>
          <span className="font-semibold">
            ABC Company
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">Interview Type</span>
          <span className="font-semibold">
            Technical Interview
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Scheduled Time</span>
          <span className="font-semibold">
            3:00 PM
          </span>
        </div>

      </div>

    </div>
  );
}

export default MeetingInfo;