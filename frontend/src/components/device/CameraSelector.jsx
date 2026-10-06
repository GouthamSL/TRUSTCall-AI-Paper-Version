import React from "react";

function CameraSelector({
  cameras,
  selectedCamera,
  setSelectedCamera,
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">

      <h2 className="text-xl font-semibold mb-5">
        Select Camera
      </h2>

      {cameras.length === 0 ? (
        <div className="text-red-400">
          No camera detected.
        </div>
      ) : (
        <select
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white outline-none"
        >
          {cameras.map((camera) => (
            <option
              key={camera.deviceId}
              value={camera.deviceId}
            >
              {camera.label || "Unknown Camera"}
            </option>
          ))}
        </select>
      )}

      {selectedCamera && (
        <div className="mt-5 bg-slate-700 rounded-lg p-4">

          <p className="text-sm text-gray-300">
            Selected Camera
          </p>

          <p className="font-semibold mt-1 break-all">
            {selectedCamera}
          </p>

        </div>
      )}

    </div>
  );
}

export default CameraSelector;