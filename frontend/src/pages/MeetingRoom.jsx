import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

import socket from "../services/socketService";

import {
  createPeerConnection,
  addLocalStream,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  onIceCandidate,
  onRemoteStream,
} from "../services/webrtcService";

import MeetingNavbar from "../components/meeting/MeetingNavbar";
import MainVideo from "../components/meeting/MainVideo";
import MeetingControls from "../components/meeting/MeetingControls";

function MeetingRoom() {
  const { meetingId } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [aiResult, setAiResult] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [candidateWarning, setCandidateWarning] = useState(null);
  const [joinStatus, setJoinStatus] = useState("requesting");
  const [admitted, setAdmitted] = useState(false);
  const admittedRef = useRef(false);
  const candidateReadySentRef = useRef(false);


  const [showAgentDetails, setShowAgentDetails] = useState(false);

  const [showMessages, setShowMessages] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "Interviewer",
      text: "Welcome to the interview.",
    },
  ]);

  const [remoteStream, setRemoteStream] = useState(null);

  // =====================================================
  // AI ANALYSIS
  // =====================================================

  const sendAIAnalysis = useCallback(
    async (stream) => {
      if (!stream || !admittedRef.current) return;

      try {
        console.log("🤖 Preparing Vision AI analysis...");

        const videoTrack = stream.getVideoTracks()[0];

        if (!videoTrack) {
          console.error("❌ Video track missing");
          return;
        }

        if (
          !videoTrack.enabled ||
          videoTrack.readyState === "ended"
        ) {
          console.log(
            "📷 Camera is off. Skipping AI analysis."
          );
          return;
        }

        // =================================================
        // CAPTURE VIDEO FRAME
        // =================================================

        let image = null;

        if ("ImageCapture" in window) {
          try {
            console.log(
              "📸 Capturing frame directly from camera track..."
            );

            const imageCapture =
              new ImageCapture(videoTrack);

            const bitmap =
              await imageCapture.grabFrame();

            const canvas =
              document.createElement("canvas");

            canvas.width =
              bitmap.width || 640;

            canvas.height =
              bitmap.height || 480;

            const ctx =
              canvas.getContext("2d");

            if (!ctx) {
              throw new Error(
                "Could not create canvas context"
              );
            }

            ctx.drawImage(
              bitmap,
              0,
              0,
              canvas.width,
              canvas.height
            );

            image =
              canvas.toDataURL(
                "image/jpeg",
                0.8
              );

            if (
              typeof bitmap.close ===
              "function"
            ) {
              bitmap.close();
            }

            console.log(
              "📸 Video frame captured with ImageCapture"
            );

          } catch (captureError) {
            console.warn(
              "⚠️ ImageCapture failed, using video fallback:",
              captureError
            );
          }
        }

        // =================================================
        // VIDEO FALLBACK
        // =================================================

        if (!image) {
          const video =
            document.createElement("video");

          video.srcObject =
            new MediaStream([videoTrack]);

          video.muted = true;
          video.playsInline = true;
          video.autoplay = true;

          video.style.position = "fixed";
          video.style.width = "1px";
          video.style.height = "1px";
          video.style.opacity = "0";
          video.style.pointerEvents = "none";

          document.body.appendChild(video);

          try {
            await video.play();
          } catch (playError) {
            console.warn(
              "⚠️ Video play warning:",
              playError
            );
          }

          await new Promise((resolve) => {
            const start = Date.now();
            const timeout = 3000;

            const checkFrame = () => {
              if (
                video.videoWidth > 0 &&
                video.videoHeight > 0
              ) {
                resolve();
                return;
              }

              if (
                Date.now() - start >=
                timeout
              ) {
                console.warn(
                  "⚠️ Video frame timeout; using available dimensions."
                );
                resolve();
                return;
              }

              requestAnimationFrame(
                checkFrame
              );
            };

            checkFrame();
          });

          const canvas =
            document.createElement("canvas");

          canvas.width =
            video.videoWidth || 640;

          canvas.height =
            video.videoHeight || 480;

          const ctx =
            canvas.getContext("2d");

          if (!ctx) {
            video.pause();
            video.srcObject = null;
            video.remove();

            throw new Error(
              "Could not create canvas context"
            );
          }

          ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );

          image =
            canvas.toDataURL(
              "image/jpeg",
              0.8
            );

          video.pause();
          video.srcObject = null;
          video.remove();

          console.log(
            "📸 Video frame captured with fallback"
          );
        }

        if (!image) {
          throw new Error(
            "Unable to capture video frame"
          );
        }

        // =================================================
        // VISION-ONLY AI ANALYSIS
        // =================================================

        console.log(
          "🤖 Sending camera frame to Vision AI..."
        );

        const response =
          await api.post(
            "/ai/live-analyze",
            {
              session_id: meetingId,
              image: image,
            }
          );

        console.log(
          "✅ VISION AI RESULT:",
          response.data
        );

        const role =
          sessionStorage.getItem("role");

        if (
          String(role || "").toLowerCase() ===
          "candidate"
        ) {
          socket.emit("ai-result", {
            meetingId,
            result: response.data,
          });

          console.log(
            "📤 Vision AI result sent to Interviewer"
          );
        }

      } catch (error) {
        console.error(
          "❌ Vision AI Analysis Error:",
          error
        );
      }
    },
    [meetingId]
  );
  // =====================================================
  // =====================================================

  useEffect(() => {
    return () => {
    };
  }, []);

  // =====================================================
  // LOCAL STREAM HANDLER
  // =====================================================

  const handleLocalStream = useCallback(
    (stream) => {
      console.log(
        "Local stream received:",
        stream
      );

      if (!stream) {
        console.warn("Local stream is missing.");
        return;
      }

      setLocalStream(stream);

      // Give the camera and microphone tracks to WebRTC.
      // The microphone is used only for the interview call.
      addLocalStream(stream);

      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        setCameraOn(
          videoTrack.enabled &&
          videoTrack.readyState !== "ended"
        );
      }

      console.log(
        "Local camera/microphone stream added to WebRTC."
      );
    },
    []
  );
  // =====================================================
  // START AI AFTER CANDIDATE IS ACTUALLY ADMITTED
  // =====================================================
  // IMPORTANT:
  // The local camera/microphone can be obtained BEFORE the
  // interviewer presses Accept. In that case handleLocalStream()
  // runs while admittedRef.current is false, so AI speech
  // detection would never start.
  //
  // This effect starts AI when BOTH are available:
  // 1. Candidate has been approved
  // 2. Local camera/microphone stream already exists
  // =====================================================

  useEffect(() => {
    const role =
      sessionStorage.getItem("role") ||
      localStorage.getItem("role");

    const isCandidate =
      String(role || "").toLowerCase() === "candidate";

    if (
      !meetingId ||
      !admitted ||
      !isCandidate ||
      !localStream
    ) {
      return;
    }

    console.log("=================================");
    console.log("ðŸ¤– STARTING CANDIDATE AI PIPELINE");
    console.log("ðŸ†” Meeting:", meetingId);
    console.log("ðŸ‘¤ Role:", role);
    console.log("ðŸŽ¥ Local stream:", localStream.id);
    console.log("=================================");

    if (
      !candidateReadySentRef.current &&
      socket.connected
    ) {
      candidateReadySentRef.current = true;

      socket.emit("candidate-ready", {
        meetingId,
      });

      console.log(
        "ðŸŸ¢ Candidate media ready. Sent candidate-ready."
      );
    }
    let aiRunning = false;

    const runVisionAnalysis = async () => {
      if (aiRunning || !admittedRef.current) return;

      aiRunning = true;
      try {
        await sendAIAnalysis(localStream);
      } finally {
        aiRunning = false;
      }
    };

    const initialTimeout = setTimeout(() => {
      runVisionAnalysis();
    }, 1500);

    const aiInterval = setInterval(() => {
      runVisionAnalysis();
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(aiInterval);
    };
  }, [
    meetingId,
    admitted,
    localStream,
    sendAIAnalysis,
  ]);

  // =====================================================
  // ADMISSION + WEBRTC + SOCKET.IO
  // =====================================================

  useEffect(() => {
    if (!meetingId) return;

    let mounted = true;

    const handleJoinRequestSent = () => {
      if (!mounted) return;
      setJoinStatus("waiting");
      console.log("ðŸŸ¡ Join request sent. Waiting for interviewer approval...");
    };

    const handleCandidateApproved = () => {
      if (!mounted) return;

      console.log("âœ… Candidate approved by interviewer.");
      admittedRef.current = true;
      candidateReadySentRef.current = false;
      setAdmitted(true);
      setJoinStatus("approved");
    };

    const handleCandidateRejected = ({ message }) => {
      if (!mounted) return;

      admittedRef.current = false;
      candidateReadySentRef.current = false;
      setAdmitted(false);
      setJoinStatus("rejected");
      setRemoteStream(null);
      console.log("âŒ Candidate request rejected:", message);
    };

    const handleJoinRequestStatus = ({ status, message }) => {
      if (!mounted) return;

      console.log("â„¹ï¸ Join status:", status, message);

      if (status === "waiting-for-interviewer") {
        setJoinStatus("waiting-for-interviewer");
      } else if (status === "meeting-full") {
        setJoinStatus("full");
      } else if (status === "request-pending") {
        setJoinStatus("waiting");
      }
    };

    const requestToJoin = () => {
      if (!mounted || admittedRef.current || !socket.connected) return;

      console.log("ðŸšª Requesting interviewer approval...");
      setJoinStatus("requesting");
      socket.emit("candidate-request-join", { meetingId });
    };

    socket.on("join-request-sent", handleJoinRequestSent);
    socket.on("candidate-approved", handleCandidateApproved);
    socket.on("candidate-rejected", handleCandidateRejected);
    socket.on("join-request-status", handleJoinRequestStatus);

    const handleSocketConnect = () => {
      console.log("ðŸŸ¢ Candidate Socket.IO connected:", socket.id);
      requestToJoin();
    };

    const handleSocketDisconnect = (reason) => {
      console.warn("ðŸ”´ Candidate Socket.IO disconnected:", reason);
    };

    const handleSocketConnectError = (error) => {
      console.error("âŒ Candidate Socket.IO connection error:", error);
    };

    socket.on("connect", handleSocketConnect);
    socket.on("disconnect", handleSocketDisconnect);
    socket.on("connect_error", handleSocketConnectError);

    if (!socket.connected) {
      socket.connect();
    } else {
      requestToJoin();
    }

    return () => {
      mounted = false;
      socket.off("join-request-sent", handleJoinRequestSent);
      socket.off("candidate-approved", handleCandidateApproved);
      socket.off("candidate-rejected", handleCandidateRejected);
      socket.off("join-request-status", handleJoinRequestStatus);
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
      socket.off("connect_error", handleSocketConnectError);
    };
  }, [meetingId]);

  // -----------------------------------------------------
  // WEBRTC STARTS ONLY AFTER INTERVIEWER APPROVES
  // -----------------------------------------------------
  useEffect(() => {
    if (!meetingId || !admitted) return;

    let mounted = true;
    const role = sessionStorage.getItem("role") || localStorage.getItem("role");

    console.log("=================================");
    console.log("ðŸŽ¬ CANDIDATE WEBRTC STARTING AFTER APPROVAL");
    console.log("ðŸ†” Meeting:", meetingId);
    console.log("ðŸ‘¤ Role:", role);
    console.log("=================================");

    createPeerConnection();

    onRemoteStream((stream) => {
      if (!mounted) return;
      console.log("ðŸŽ¬ REMOTE STREAM RECEIVED:", stream?.id);
      setRemoteStream(stream);
    });

    onIceCandidate((candidate) => {
      if (!candidate || !socket.connected || !admittedRef.current) return;

      socket.emit("webrtc-ice-candidate", {
        meetingId,
        candidate,
      });
    });

    const handleOffer = async ({ offer, from }) => {
      if (String(role || "").toLowerCase() !== "candidate" || !admittedRef.current) return;

      try {
        console.log("ðŸ“¨ WEBRTC OFFER RECEIVED FROM:", from);

        if (!offer) return;

        await setRemoteDescription(offer);
        const answer = await createAnswer();

        if (!answer) return;

        socket.emit("webrtc-answer", {
          meetingId,
          answer,
        });

        console.log("ðŸ“¤ WEBRTC ANSWER SENT");
      } catch (error) {
        console.error("âŒ Error processing WebRTC offer:", error);
      }
    };

    const handleRemoteIceCandidate = async ({ candidate }) => {
      if (!candidate || !admittedRef.current) return;

      try {
        await addIceCandidate(candidate);
      } catch (error) {
        console.error("âŒ Remote ICE error:", error);
      }
    };

    const handleParticipantLeft = ({ role: leftRole }) => {
      console.log("ðŸ‘‹ PARTICIPANT LEFT:", leftRole);
      setRemoteStream(null);
    };

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-ice-candidate", handleRemoteIceCandidate);
    socket.on("participant-left", handleParticipantLeft);

    return () => {
      mounted = false;
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-ice-candidate", handleRemoteIceCandidate);
      socket.off("participant-left", handleParticipantLeft);
    };
  }, [meetingId, admitted]);

  // =====================================================
  // CHAT
  // =====================================================

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    setMessages([
      ...messages,
      {
        sender: "You",
        text: message,
      },
    ]);

    setMessage("");
  };

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const consensus =
    aiResult?.consensus || {};

  const vision =
    aiResult?.vision || {};

  const audio =
    aiResult?.audio || {};

// =====================================================
// CANDIDATE CAMERA / FACE NOTIFICATIONS
// =====================================================
useEffect(() => {
  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role");

  // Notifications are strictly Candidate-side.
  if (String(role || "").toLowerCase() !== "candidate") {
    setCandidateWarning(null);
    return;
  }

  // Get the actual video track from the local stream.
  const videoTrack = localStream?.getVideoTracks?.()[0];

  // Determine the REAL camera state.
  const cameraIsActuallyOn =
    !!videoTrack &&
    videoTrack.readyState === "live" &&
    videoTrack.enabled;

  // =================================================
  // CAMERA OFF
  // =================================================
  if (!cameraIsActuallyOn) {
    setCandidateWarning({
      type: "camera",
      message:
        "Your camera is off. Please turn on your camera to continue the interview.",
    });
    return;
  }

  // =================================================
  // CAMERA ON â†’ CHECK FACE COUNT
  // =================================================
  const faces = Number(vision?.faces_detected);

  // AI has not produced a face result yet.
  if (!Number.isFinite(faces)) {
    setCandidateWarning(null);
    return;
  }

  // =================================================
  // NO FACE
  // =================================================
  if (faces === 0) {
    setCandidateWarning({
      type: "face",
      message:
        "Your face is not detected. Please position your face clearly in front of the camera.",
    });
    return;
  }

  // =================================================
  // MULTIPLE FACES
  // =================================================
  if (faces > 1) {
    setCandidateWarning({
      type: "multiple",
      message:
        "Multiple faces detected. Please ensure that only you are visible in the camera.",
    });
    return;
  }

  // =================================================
  // EXACTLY ONE FACE
  // =================================================
  setCandidateWarning(null);
}, [
  localStream,
  cameraOn,
  vision?.faces_detected,
]);

  const retryJoinRequest = () => {
    if (!socket.connected) {
      socket.connect();
      return;
    }

    setJoinStatus("requesting");
    socket.emit("candidate-request-join", { meetingId });
  };

  const formatStatus = (status) => {
    if (!status) return "Processing";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatProbability = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "N/A";
    }

    return `${(number * 100).toFixed(2)}%`;
  };

  const formatScore = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "N/A";
    }

    return Number(value).toFixed(2);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-screen h-screen bg-[#0B0F19] text-white overflow-hidden">

      {/* =================================================
          CANDIDATE-ONLY CAMERA / FACE WARNING
      ================================================= */}
      {admitted &&
        (localStorage.getItem("role") ||
          sessionStorage.getItem("role")) === "Candidate" &&
        candidateWarning && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[min(90vw,700px)]"
            role="alert"
            aria-live="assertive"
          >
            <div
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl ${
                candidateWarning.type === "camera"
                  ? "bg-red-950/95 border-red-500"
                  : "bg-yellow-950/95 border-yellow-500"
              }`}
            >
              <div className="text-2xl flex-shrink-0">
                {candidateWarning.type === "camera" ? "ðŸ“·" : "âš ï¸"}
              </div>

              <p className="text-sm md:text-base font-semibold leading-6">
                {candidateWarning.message}
              </p>
            </div>
          </div>
        )}

      <MeetingNavbar />

      <main className="h-[calc(100vh-144px)] min-h-0 px-3 py-2 pb-2">

        <div className="grid grid-cols-12 gap-3 h-full min-h-0">

          {/* =================================================
              MAIN VIDEO
          ================================================= */}

          <section className="col-span-8 h-full min-h-0 min-w-0">
            {admitted ? (
              <MainVideo
                remoteStream={remoteStream}
                onLocalStream={handleLocalStream}
              />
            ) : (
              <div className="h-full rounded-2xl border border-gray-700 bg-[#111827] flex items-center justify-center p-8">
                <div className="w-full max-w-lg text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-4xl">
                    {joinStatus === "rejected" ? "âŒ" : "â³"}
                  </div>

                  <h2 className="text-2xl font-bold mt-6">
                    {joinStatus === "rejected"
                      ? "Join request not approved"
                      : joinStatus === "waiting-for-interviewer"
                        ? "Waiting for interviewer"
                        : joinStatus === "full"
                          ? "Meeting is full"
                          : "Waiting for interviewer approval"}
                  </h2>

                  <p className="text-gray-400 mt-3 leading-6">
                    {joinStatus === "rejected"
                      ? "You can send another request when you are ready."
                      : joinStatus === "waiting-for-interviewer"
                        ? "The interviewer has not opened the meeting yet."
                        : joinStatus === "full"
                          ? "Another candidate is already in this interview."
                          : "Your camera, microphone, WebRTC connection, and AI analysis will start only after the interviewer accepts your request."}
                  </p>

                  {joinStatus === "rejected" && (
                    <button
                      type="button"
                      onClick={retryJoinRequest}
                      className="mt-6 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 font-semibold"
                    >
                      Request to Join Again
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>


          {/* =================================================
              RIGHT PANEL
          ================================================= */}

          <aside className="col-span-4 h-full min-h-0 overflow-y-auto pr-1">

            {/* AI analysis is intentionally hidden on the Candidate page.
                The Candidate runs analysis silently in the background.
                Only the Interviewer sees the AI result. */}
            {sessionStorage.getItem("role") === "Interviewer" && (
              <>
                {!aiResult && (
                  <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5 mb-4">
                    <h2 className="text-lg font-semibold">
                      ðŸ¤– AI Trust Analysis
                    </h2>

                    <p className="text-sm text-gray-400 mt-2">
                      Waiting for candidate analysis...
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      AI analysis is running silently on the candidate side.
                    </p>
                  </div>
                )}

                {aiResult && (

                  <div className="mb-4">

                {/* -------------------------------------------------
                    CLICKABLE CONSENSUS SUMMARY
                ------------------------------------------------- */}

                <button
                  type="button"
                  onClick={() =>
                    setShowAgentDetails(
                      !showAgentDetails
                    )
                  }
                  className="w-full text-left bg-[#111827] border border-gray-700 hover:border-purple-500 rounded-2xl p-5 transition-all duration-200"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-lg font-semibold">
                        ðŸ¤– AI Trust Score
                      </h2>

                      <p className="text-xs text-gray-400 mt-1">
                        Final Consensus
                      </p>

                    </div>

                    <span className="text-xl">
                      {showAgentDetails
                        ? "â–²"
                        : "â–¼"}
                    </span>

                  </div>


                  <div className="mt-4">

                    <p className="text-4xl font-bold text-purple-400">
                      {formatScore(
                        consensus.final_trust_score
                      )}
                    </p>

                    <p
                      className={`mt-2 text-sm font-semibold ${
                        consensus.status ===
                        "likely_real"
                          ? "text-green-400"
                          : consensus.status ===
                            "uncertain"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatStatus(
                        consensus.status
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      {showAgentDetails
                        ? "Click to hide agent details"
                        : "Click to view agent analysis"}
                    </p>

                  </div>

                </button>


                {/* =================================================
                    EXPANDED AGENT DETAILS
                ================================================= */}

                {showAgentDetails && (

                  <div className="bg-[#0F172A] border-x border-b border-gray-700 rounded-b-2xl p-4 space-y-3">

                    {/* -------------------------------------------------
                        CONSENSUS AGENT
                    ------------------------------------------------- */}

                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-4">

                      <div className="flex items-center justify-between">

                        <h3 className="font-semibold">
                          ðŸŽ¯ Consensus Agent
                        </h3>

                        <span className="text-purple-400 text-sm">
                          Final
                        </span>

                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-xs text-gray-400">
                            Final Trust Score
                          </p>

                          <p className="text-lg font-semibold">
                            {formatScore(
                              consensus.final_trust_score
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Status
                          </p>

                          <p className="text-sm font-semibold">
                            {formatStatus(
                              consensus.status
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="mt-3">

                        <p className="text-xs text-gray-400">
                          Integration Weights
                        </p>

                        <p className="text-sm text-gray-300 mt-1">
                          Vision:{" "}
                          {(
                            (consensus.weights
                              ?.vision || 0) *
                            100
                          ).toFixed(0)}
                          % &nbsp; | &nbsp;
                          Audio:{" "}
                          {(
                            (consensus.weights
                              ?.audio || 0) *
                            100
                          ).toFixed(0)}
                          %
                        </p>

                      </div>

                    </div>


                    {/* -------------------------------------------------
                        VISION / FACE AGENT
                    ------------------------------------------------- */}

                    <div className="bg-[#111827] border border-gray-700 rounded-xl p-4">

                      <div className="flex items-center justify-between">

                        <h3 className="font-semibold">
                          ðŸ‘¤ Face / Vision Agent
                        </h3>

                        <span className="text-blue-400 text-sm">
                          Vision
                        </span>

                      </div>

                      <div className="mt-3 space-y-3">

                        <div className="flex justify-between">

                          <span className="text-xs text-gray-400">
                            Vision Score
                          </span>

                          <span className="text-sm font-semibold">
                            {formatScore(
                              consensus.vision_score ??
                              vision.vision_score
                            )}
                          </span>

                        </div>


                        <div className="flex justify-between">

                          <span className="text-xs text-gray-400">
                            Real Probability
                          </span>

                          <span className="text-sm">
                            {formatProbability(
                              vision.real_probability
                            )}
                          </span>

                        </div>


                        <div className="flex justify-between">

                          <span className="text-xs text-gray-400">
                            Deepfake Probability
                          </span>

                          <span className="text-sm">
                            {formatProbability(
                              vision.deepfake_probability
                            )}
                          </span>

                        </div>


                        <div className="flex justify-between">

                          <span className="text-xs text-gray-400">
                            Faces Detected
                          </span>

                          <span className="text-sm">
                            {vision.faces_detected ??
                              "N/A"}
                          </span>

                        </div>


                        <div className="flex justify-between">

                          <span className="text-xs text-gray-400">
                            Landmarks Detected
                          </span>

                          <span className="text-sm">
                            {vision.landmarks_detected ??
                              "N/A"}
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* -------------------------------------------------
                        ACTIVE SIGNALS
                    ------------------------------------------------- */}

                    <div className="text-center pt-1">

                      <p className="text-xs text-gray-500">
                        Active Signals
                      </p>

                      <p className="text-xs text-gray-300 mt-1">
                        {consensus.active_signals
                          ?.join(" + ")
                          .toUpperCase() ||
                          "N/A"}
                      </p>

                    </div>

                  </div>

                )}

                  </div>

                )}
              </>
            )}

          </aside>

        </div>

      </main>


      {/* =================================================
          CHAT PANEL
      ================================================= */}

      {showMessages && (

        <div className="fixed top-0 right-0 bottom-20 w-96 bg-[#111827] border-l border-gray-700 shadow-2xl z-50">

          <div className="flex flex-col h-full">

            <div className="flex justify-between items-center p-4 border-b border-gray-700">

              <h2 className="text-xl font-semibold">
                ðŸ’¬ Messages
              </h2>

              <button
                onClick={() =>
                  setShowMessages(false)
                }
                className="text-2xl text-gray-300 hover:text-red-400"
              >
                Ã—
              </button>

            </div>


            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {messages.map(
                (msg, index) => (

                  <div
                    key={index}
                    className={
                      msg.sender === "You"
                        ? "bg-purple-700 p-3 rounded-xl ml-12"
                        : "bg-gray-800 p-3 rounded-xl"
                    }
                  >

                    <p className="text-sm font-semibold text-purple-300">
                      {msg.sender}
                    </p>

                    <p className="mt-1">
                      {msg.text}
                    </p>

                  </div>

                )
              )}

            </div>


            <div className="border-t border-gray-700 p-4 mb-20">

              <div className="flex gap-2">

                <input
                  type="text"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={handleSend}
                  className="bg-purple-600 hover:bg-purple-700 px-5 rounded-lg"
                >
                  Send
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          MEETING CONTROLS
      ================================================= */}

      {admitted && (
        <MeetingControls
        showMessages={showMessages}
        setShowMessages={setShowMessages}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        localStream={localStream}
        onCameraStatusChange={setCameraOn}
        />
      )}

    </div>
  );
}

export default MeetingRoom;









