import React from "react";
import useCamera from "../../hooks/useCamera";

function DevicePreview({ selectedCamera }) {
  const {
    videoRef,
} = useCamera(selectedCamera);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">

      <h2 className="text-xl font-semibold mb-4">
        Camera Preview
      </h2>

      <div className="rounded-xl overflow-hidden bg-black h-[380px] flex items-center justify-center">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

      </div>

    </div>
  );
}

export default DevicePreview;