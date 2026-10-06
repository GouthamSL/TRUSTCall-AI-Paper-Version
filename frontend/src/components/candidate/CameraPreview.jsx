import { FaVideo, FaCamera, FaSun, FaMicrophone } from "react-icons/fa";

function CameraPreview() {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FaVideo className="text-purple-600 text-xl" />
        <h2 className="text-2xl font-semibold">Camera Preview</h2>
      </div>

      {/* Camera Area */}
      <div className="relative rounded-2xl overflow-hidden">

        {/* Temporary Placeholder */}
        <div className="h-[380px] bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 text-xl">
            Camera Preview
          </p>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 flex gap-3">

          <button className="bg-black/50 text-white p-3 rounded-full">
            <FaCamera />
          </button>

          <button className="bg-black/50 text-white p-3 rounded-full">
            <FaSun />
          </button>

        </div>

        {/* Mic */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">

          <button className="bg-black/50 text-white p-4 rounded-full">
            <FaMicrophone />
          </button>

        </div>

        {/* Signal */}
        <div className="absolute bottom-4 right-4 bg-black/50 rounded-full px-3 py-2">
          <div className="flex gap-1 items-end">

            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <div className="w-2 h-4 bg-green-500 rounded"></div>
            <div className="w-2 h-6 bg-green-500 rounded"></div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default CameraPreview;