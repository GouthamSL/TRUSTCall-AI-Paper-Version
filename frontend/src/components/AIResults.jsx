function AIResults({ detectionData }) {

  const cameraStopped = detectionData.status === "STOPPED";

  const trustScore = cameraStopped
    ? "--"
    : `${(detectionData.real_probability * 100).toFixed(2)}%`;

  return (
    <div className="h-full bg-slate-900 border border-slate-700 rounded-xl flex flex-col">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-xl font-bold text-cyan-400">
          AI Analysis
        </h2>

        <p className="text-xs text-slate-400">
          Real-Time Detection Results
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 p-4 space-y-3">

        <ResultRow
          label="Status"
          value={cameraStopped ? "CAMERA OFF" : detectionData.status}
          color={cameraStopped ? "text-red-400" : "text-yellow-400"}
        />

        <ResultRow
          label="Trust Score"
          value={trustScore}
          color="text-green-400"
        />

        <ResultRow
          label="Vision Score"
          value={cameraStopped ? "--" : detectionData.vision_score.toFixed(4)}
        />

        <ResultRow
          label="Real Probability"
          value={
            cameraStopped
              ? "--"
              : `${(detectionData.real_probability * 100).toFixed(2)}%`
          }
          color="text-green-400"
        />

        <ResultRow
          label="Deepfake Probability"
          value={
            cameraStopped
              ? "--"
              : `${(detectionData.deepfake_probability * 100).toFixed(2)}%`
          }
          color="text-red-400"
        />

        <ResultRow
          label="Faces Detected"
          value={cameraStopped ? "--" : detectionData.faces_detected}
        />

        <ResultRow
          label="Blink Detected"
          value={
            cameraStopped
              ? "--"
              : detectionData.blink_detected
              ? "YES"
              : "NO"
          }
        />

        <ResultRow
          label="Left Eye"
          value={
            cameraStopped
              ? "--"
              : detectionData.left_eye_open
              ? "OPEN"
              : "CLOSED"
          }
          color="text-green-400"
        />

        <ResultRow
          label="Right Eye"
          value={
            cameraStopped
              ? "--"
              : detectionData.right_eye_open
              ? "OPEN"
              : "CLOSED"
          }
          color="text-green-400"
        />

        <ResultRow
          label="Face Landmarks"
          value={
            cameraStopped
              ? "NOT DETECTED"
              : detectionData.landmarks_detected
              ? "DETECTED"
              : "NOT DETECTED"
          }
          color={cameraStopped ? "text-red-400" : "text-green-400"}
        />

      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 px-4 py-3">
        <div className="flex justify-between">
          <span className="text-xs text-slate-500">
            Backend
          </span>

          <span
            className={`font-semibold ${
              cameraStopped ? "text-red-400" : "text-green-400"
            }`}
          >
            {cameraStopped ? "IDLE" : "CONNECTED"}
          </span>
        </div>
      </div>

    </div>
  );
}

function ResultRow({ label, value, color = "text-white" }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800 pb-2">

      <span className="text-slate-400 text-sm">
        {label}
      </span>

      <span className={`font-semibold text-sm ${color}`}>
        {value}
      </span>

    </div>
  );
}

export default AIResults;