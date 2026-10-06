import { FaCog, FaCamera, FaMicrophone, FaVolumeUp } from "react-icons/fa";

function DeviceSettings() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4">

      <div className="flex items-center gap-3 mb-6">
        <FaCog className="text-purple-600 text-xl" />
        <h2 className="text-2xl font-semibold">
          Device Settings
        </h2>
      </div>

      <div className="space-y-3">

        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <FaCamera className="text-gray-500" />
            <span>Camera</span>
          </div>

          <span className="font-medium">
            Integrated Webcam
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <FaMicrophone className="text-gray-500" />
            <span>Microphone</span>
          </div>

          <span className="font-medium">
            Built-in Microphone
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaVolumeUp className="text-gray-500" />
            <span>Speaker</span>
          </div>

          <span className="font-medium">
            Default Speaker
          </span>
        </div>

      </div>

    </div>
  );
}

export default DeviceSettings;