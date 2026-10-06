import { FaExpand } from "react-icons/fa";
import useCamera from "../../hooks/useCamera";
import { useEffect, useRef } from "react";

import { addLocalStream } from "../../services/webrtcService";

function MainVideo({
  remoteStream,
  onLocalStream,
}) {
  const role =
    sessionStorage.getItem("role") ||
    "Candidate";

  const selectedCamera =
    localStorage.getItem("selectedCamera");

  let meetingData = null;

  try {
    meetingData = JSON.parse(
      localStorage.getItem("meeting") || "null"
    );
  } catch (error) {
    console.warn(
      "⚠️ Could not read meeting data:",
      error
    );
  }

  const participantName =
    role === "Interviewer"
      ? "Candidate"
      : meetingData?.interviewer || "Interviewer";

  const company =
    meetingData?.company || "TRUSTCall AI";

  /*
   * Camera hook.
   * We use the returned stream and explicitly
   * attach it to our own video element below.
   */
  const { stream } = useCamera(selectedCamera);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // =====================================================
  // LOCAL CAMERA
  // =====================================================

  useEffect(() => {
    if (!stream) {
      console.log(
        "⏳ Waiting for local camera stream..."
      );
      return;
    }

    console.log(
      "🎥 Local camera stream available:",
      stream.id
    );

    console.log(
      "🎥 Local tracks:",
      stream.getTracks().map((track) => ({
        kind: track.kind,
        id: track.id,
        enabled: track.enabled,
        readyState: track.readyState,
      }))
    );

    /*
     * Explicitly attach local stream to the
     * small self-preview.
     */
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;

      localVideoRef.current
        .play()
        .catch((error) => {
          console.warn(
            "⚠️ Local video autoplay warning:",
            error
          );
        });

      console.log(
        "✅ Local video attached to self-preview"
      );
    }

    /*
     * Keep the existing WebRTC behavior.
     */
    addLocalStream(stream);

    if (onLocalStream) {
      onLocalStream(stream);
    }
  }, [stream, onLocalStream]);

  // =====================================================
  // REMOTE / CANDIDATE VIDEO
  // =====================================================

  useEffect(() => {
    if (!remoteStream) {
      console.log(
        "⏳ Waiting for remote participant stream..."
      );
      return;
    }

    if (!remoteVideoRef.current) {
      console.warn(
        "⚠️ Remote video element not ready."
      );
      return;
    }

    console.log(
      "🎥 Remote Video Attached:",
      remoteStream.id
    );

    console.log(
      "🎥 Remote stream tracks:",
      remoteStream.getTracks().map((track) => ({
        kind: track.kind,
        id: track.id,
        enabled: track.enabled,
        readyState: track.readyState,
      }))
    );

    remoteVideoRef.current.srcObject =
      remoteStream;

    remoteVideoRef.current
      .play()
      .catch((error) => {
        console.warn(
          "⚠️ Remote video autoplay warning:",
          error
        );
      });
  }, [remoteStream]);

  // =====================================================
  // DEBUG
  // =====================================================

  useEffect(() => {
    console.log(
      "👤 MainVideo Role:",
      role
    );

    console.log(
      "👤 Large Video:",
      role === "Interviewer"
        ? "Candidate"
        : "Interviewer"
    );

    console.log(
      "👤 Small Video:",
      role === "Interviewer"
        ? "Interviewer"
        : "Candidate"
    );
  }, [role]);

  return (
    <div className="relative h-full w-full min-h-0 rounded-2xl overflow-hidden border border-gray-800 bg-[#161B26]">

      {/* =================================================
          LARGE REMOTE VIDEO
      ================================================= */}

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-[#0B0F19]"
      />

      {/* =================================================
          LIVE BADGE
      ================================================= */}

      <div className="absolute top-3 left-3 z-30">
        <div className="bg-red-600 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold shadow-lg">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
          LIVE •
        </div>
      </div>

      {/* =================================================
          FULLSCREEN
      ================================================= */}

      <button
        className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex justify-center items-center transition"
        onClick={() => {
          if (
            remoteVideoRef.current &&
            remoteVideoRef.current.requestFullscreen
          ) {
            remoteVideoRef.current.requestFullscreen();
          }
        }}
      >
        <FaExpand className="text-white text-base" />
      </button>

      {/* =================================================
          REMOTE PARTICIPANT NAME
      ================================================= */}

      <div className="absolute bottom-3 left-3 z-30 bg-black/70 backdrop-blur rounded-xl px-4 py-2.5 max-w-[55%]">
        <h2 className="text-xl md:text-2xl font-bold truncate">
          {participantName}
        </h2>

        <p className="text-sm text-gray-300 truncate">
          {company}
        </p>
      </div>

      {/* =================================================
          LOCAL / SELF PREVIEW
          
          IMPORTANT:
          bottom-20 keeps it ABOVE the meeting controls.
      ================================================= */}

      <div className="absolute bottom-20 right-4 z-[100] w-[clamp(180px,25%,280px)] aspect-video rounded-2xl overflow-hidden border-2 border-purple-600 bg-black shadow-2xl">

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* SELF LABEL */}

        <div className="absolute top-2 left-2 max-w-[85%]">

          <div className="bg-purple-700/95 px-2.5 py-1 rounded-lg text-xs md:text-sm font-semibold truncate">
            {localStorage.getItem("userName") ||
              (role === "Interviewer"
                ? "Interviewer"
                : "Candidate")}
          </div>

          <div className="mt-1.5 bg-black/70 px-2 py-0.5 rounded-full text-[10px] md:text-xs">
            🟢 {role}
          </div>

        </div>

      </div>

    </div>
  );
}

export default MainVideo;