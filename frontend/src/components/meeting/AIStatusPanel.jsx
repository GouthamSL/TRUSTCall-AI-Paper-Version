import {
  FaShieldAlt,
  FaUserShield,
  FaMicrophoneAlt,
  FaCheckCircle,
  FaWifi,
  FaCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import { useState } from "react";

function AIStatusPanel({ aiResult }) {
  // =====================================================
  // EXPAND / COLLAPSE
  // =====================================================

  const [showDetails, setShowDetails] = useState(false);

  // =====================================================
  // SAFE OBJECTS
  // =====================================================

  const vision = aiResult?.vision || {};
  const audio = aiResult?.audio || {};
  const consensus = aiResult?.consensus || {};

  // =====================================================
  // HELPERS
  // =====================================================

  const getNumber = (...values) => {
    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        Number.isFinite(Number(value))
      ) {
        return Number(value);
      }
    }

    return null;
  };

  const toPercentage = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    let number = Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    // Backend normally returns 0-1.
    if (number >= 0 && number <= 1) {
      number *= 100;
    }

    return Math.max(0, Math.min(100, number));
  };

  const formatPercentage = (value) => {
    const percentage = toPercentage(value);

    if (percentage === null) {
      return "â€”";
    }

    return `${percentage.toFixed(0)}%`;
  };

  const getStatus = (...values) => {
    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return String(value)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
          );
      }
    }

    return null;
  };

  // =====================================================
  // VISION SCORE
  // =====================================================

  const visionDirectScore = getNumber(
    vision.trust_score,
    vision.trust_probability,
    vision.real_probability,
    vision.real_score,
    vision.confidence
  );

  const visionFakeScore = getNumber(
    vision.fake_probability,
    vision.deepfake_probability,
    vision.spoof_probability
  );

  const visionScore =
    visionDirectScore !== null
      ? visionDirectScore
      : visionFakeScore !== null
      ? 1 - visionFakeScore
      : null;

  // =====================================================
  // AUDIO SCORE
  // =====================================================

  const audioDirectScore = getNumber(
    audio.trust_score,
    audio.trust_probability,
    audio.bona_fide_probability,
    audio.real_probability,
    audio.audio_trust,
    audio.confidence
  );

  const audioSpoofScore = getNumber(
    audio.spoof_probability,
    audio.fake_probability,
    audio.deepfake_probability
  );

  const audioScore =
    audioDirectScore !== null
      ? audioDirectScore
      : audioSpoofScore !== null
      ? 1 - audioSpoofScore
      : null;

  // =====================================================
  // CONSENSUS SCORE
  // =====================================================

  const consensusScore = getNumber(
    consensus.trust_score,
    consensus.trust_probability,
    consensus.final_score,
    consensus.score,
    consensus.confidence,
    aiResult?.trust_score,
    aiResult?.final_score
  );

  // =====================================================
  // STATUS
  // =====================================================

  const visionStatus =
    getStatus(
      vision.status,
      vision.verdict,
      vision.result
    ) ||
    (aiResult ? "Processing" : "Waiting");

  const audioStatus =
    getStatus(
      audio.status,
      audio.verdict,
      audio.result,
      audio.av_status
    ) ||
    (aiResult ? "Processing" : "Waiting");

  const consensusStatus =
    getStatus(
      consensus.status,
      consensus.verdict,
      consensus.result,
      consensus.decision
    ) ||
    (aiResult ? "Processing" : "Waiting");

  // =====================================================
  // FINAL RESULT STATUS
  // =====================================================

  const finalStatus =
    getStatus(
      consensus.status,
      consensus.verdict,
      consensus.result,
      consensus.decision,
      aiResult?.status,
      aiResult?.verdict,
      aiResult?.decision
    ) ||
    (aiResult ? "Processing" : "Waiting");

  // =====================================================
  // AI STATE
  // =====================================================

  const aiActive = !!aiResult;

  // =====================================================
  // FACE COUNT
  // =====================================================

  const facesDetected =
    vision.faces_detected !== undefined &&
    vision.faces_detected !== null
      ? vision.faces_detected
      : null;

  // =====================================================
  // AUDIO AV SCORE
  // =====================================================

  const avScore = getNumber(
    audio.av_consistency_score,
    audio.av_score,
    audio.sync_score,
    audio.lip_sync_score
  );

  // =====================================================
  // FINAL SCORE COLOR
  // =====================================================

  const getScoreColor = (score) => {
    const percentage = toPercentage(score);

    if (percentage === null) {
      return "text-gray-400";
    }

    if (percentage >= 75) {
      return "text-green-400";
    }

    if (percentage >= 50) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("fake") ||
      value.includes("spoof") ||
      value.includes("alert") ||
      value.includes("suspicious")
    ) {
      return "text-red-400";
    }

    if (
      value.includes("uncertain") ||
      value.includes("processing") ||
      value.includes("waiting") ||
      value.includes("insufficient")
    ) {
      return "text-yellow-400";
    }

    return "text-green-400";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* =================================================
          AI MONITORING CARD
      ================================================= */}

      <div className="bg-[#1E2433] rounded-2xl p-4 border border-gray-800">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center gap-3">

          <FaShieldAlt className="text-purple-500 text-xl" />

          <div className="flex-1">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold text-white">
                AI Monitoring
              </h2>

              <div className="flex items-center gap-2">

                <FaCircle
                  className={`text-xs ${
                    aiActive
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                />

                <span
                  className={`text-xs font-semibold ${
                    aiActive
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {aiActive ? "LIVE" : "WAITING"}
                </span>

              </div>

            </div>

            <p className="text-gray-400 text-sm">
              {aiActive
                ? "Live candidate analysis received"
                : "Waiting for candidate AI analysis"}
            </p>

          </div>

        </div>


        {/* =================================================
            FINAL RESULT
        ================================================= */}

        <div className="mt-4 bg-[#161B26] rounded-2xl p-4 border border-gray-700">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">

              <FaCheckCircle className="text-blue-400 text-xl" />

            </div>

            <div className="flex-1">

              <p className="text-gray-400 text-xs uppercase tracking-wide">
                Final AI Result
              </p>

              <h3 className="text-xl font-bold text-white">
                Consensus Analysis
              </h3>

            </div>

            <div className="text-right">

              <div
                className={`text-3xl font-bold ${getScoreColor(
                  consensusScore
                )}`}
              >
                {formatPercentage(consensusScore)}
              </div>

              <div
                className={`text-xs font-semibold ${getStatusColor(
                  finalStatus
                )}`}
              >
                {finalStatus}
              </div>

            </div>

          </div>


          {/* =================================================
              EXPAND BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setShowDetails((previous) => !previous)
            }
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#252D3D] hover:bg-[#30394D] border border-gray-700 rounded-xl py-2.5 text-sm font-semibold text-gray-200 transition"
          >

            {showDetails ? (
              <>
                <FaChevronUp />
                Hide AI Analysis
              </>
            ) : (
              <>
                <FaChevronDown />
                View AI Analysis
              </>
            )}

          </button>

        </div>


        {/* =================================================
            EXPANDED AI AGENTS
        ================================================= */}

        {showDetails && (

          <div className="mt-3 space-y-3">

            {/* =================================================
                VISION AGENT
            ================================================= */}

            <div className="bg-[#161B26] rounded-2xl p-3 border border-gray-700">

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-green-900 flex items-center justify-center">

                    <FaUserShield className="text-green-400 text-lg" />

                  </div>

                  <div>

                    <h3 className="text-lg font-semibold text-white">
                      Vision Agent
                    </h3>

                    <p className="text-gray-400 text-xs">
                      Liveness & Deepfake Detection
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <div
                    className={`text-2xl font-bold ${getScoreColor(
                      visionScore
                    )}`}
                  >
                    {formatPercentage(visionScore)}
                  </div>

                  <p
                    className={`text-xs ${getStatusColor(
                      visionStatus
                    )}`}
                  >
                    {visionStatus}
                  </p>

                </div>

              </div>


              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">

                <div className="bg-[#1E2433] rounded-lg p-2">

                  <p className="text-gray-500">
                    Faces Detected
                  </p>

                  <p className="text-white font-semibold">
                    {facesDetected !== null
                      ? facesDetected
                      : "â€”"}
                  </p>

                </div>

                <div className="bg-[#1E2433] rounded-lg p-2">

                  <p className="text-gray-500">
                    Result
                  </p>

                  <p
                    className={`font-semibold ${getStatusColor(
                      visionStatus
                    )}`}
                  >
                    {visionStatus}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                CONSENSUS AGENT
            ================================================= */}

            <div className="bg-[#161B26] rounded-2xl p-3 border border-gray-700">

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-blue-900 flex items-center justify-center">

                    <FaCheckCircle className="text-blue-400 text-lg" />

                  </div>

                  <div>

                    <h3 className="text-lg font-semibold text-white">
                      Consensus Agent
                    </h3>

                    <p className="text-gray-400 text-xs">
                      Vision-Based Final Decision
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <div
                    className={`text-2xl font-bold ${getScoreColor(
                      consensusScore
                    )}`}
                  >
                    {formatPercentage(consensusScore)}
                  </div>

                  <p
                    className={`text-xs ${getStatusColor(
                      consensusStatus
                    )}`}
                  >
                    {consensusStatus}
                  </p>

                </div>

              </div>


              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">

                <div className="bg-[#1E2433] rounded-lg p-2">

                  <p className="text-gray-500">
                    Vision Input
                  </p>

                  <p className="text-white font-semibold">
                    {formatPercentage(visionScore)}
                  </p>

                </div>

                <div className="bg-[#1E2433] rounded-lg p-2">

                  <p className="text-gray-500">
                    Final Trust Score
                  </p>

                  <p className="text-white font-semibold">
                    {formatPercentage(consensusScore)}
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          CONNECTION STATUS
      ===================================================== */}

      <div className="bg-[#161B26] rounded-2xl p-3 border border-gray-800">

        <h2 className="text-xl font-bold text-white mb-3">
          Connection Status
        </h2>

        <div className="space-y-3">

          <div className="flex justify-between items-center">

            <span className="text-gray-400">
              Status
            </span>

            <span className="flex items-center gap-2 text-green-400">

              <FaWifi />

              Connected

            </span>

          </div>


          <div className="flex justify-between">

            <span className="text-gray-400">
              AI Pipeline
            </span>

            <span
              className={
                aiActive
                  ? "text-green-400"
                  : "text-yellow-400"
              }
            >
              {aiActive
                ? "Receiving"
                : "Waiting"}
            </span>

          </div>


          <div className="flex justify-between">

            <span className="text-gray-400">
              Network Quality
            </span>

            <span className="text-green-400">
              Good
            </span>

          </div>


          <div className="flex justify-between">

            <span className="text-gray-400">
              Latency
            </span>

            <span className="text-white">
              32 ms
            </span>

          </div>


          <div className="flex justify-between">

            <span className="text-gray-400">
              Packet Loss
            </span>

            <span className="text-white">
              0.2%
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          SECURITY CARD
      ===================================================== */}

      <div className="bg-gradient-to-r from-purple-900 to-[#31234B] rounded-3xl p-4 border border-gray-800">

        <div className="flex items-start gap-3">

          <FaShieldAlt className="text-purple-400 text-xl mt-1" />

          <p className="text-gray-200 leading-6">

            TRUSTCall AI is ensuring a secure
            and fair interview experience.

          </p>

        </div>

      </div>

    </div>
  );
}

export default AIStatusPanel;
