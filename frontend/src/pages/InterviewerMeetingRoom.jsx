import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MeetingNavbar from "../components/meeting/MeetingNavbar";
import MainVideo from "../components/meeting/MainVideo";
import AIStatusPanel from "../components/meeting/AIStatusPanel";
import MeetingControls from "../components/meeting/MeetingControls";

import socket from "../services/socketService";

import {
  createPeerConnection,
  createOffer,
  setRemoteDescription,
  addIceCandidate,
  onIceCandidate,
  onRemoteStream,
} from "../services/webrtcService";

function InterviewerMeetingRoom() {
  const { meetingId } = useParams();

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

  const [candidateJoinRequest, setCandidateJoinRequest] = useState(null);
  const [meetingStatus, setMeetingStatus] = useState("waiting");

  // =====================================================
  // AI RESULT STATE
  // =====================================================
  // The communication server forwards the candidate's
  // "ai-result" event directly to the interviewer socket.
  // Keep the latest result here so the UI updates immediately.
  const [aiResult, setAiResult] = useState(null);
  const [aiResultReceivedAt, setAiResultReceivedAt] = useState(null);

  // =====================================================
  // INTERVIEWER ROLE
  // =====================================================

  useEffect(() => {
    sessionStorage.setItem("role", "Interviewer");
    localStorage.setItem("role", "Interviewer");

    console.log("");
  }, []);

  // =====================================================
  // WEBRTC + SOCKET.IO
  // =====================================================

  useEffect(() => {
    if (!meetingId) {
      console.error("");
      return;
    }

    let mounted = true;

    const role = "interviewer";

    console.log("=================================================");
    console.log("");
    console.log("", meetingId);
    console.log("", role);
    console.log("=================================================");

    // -------------------------------------------------
    // CREATE PEER CONNECTION
    // -------------------------------------------------

    console.log("");

    createPeerConnection();

    // -------------------------------------------------
    // REMOTE STREAM
    // -------------------------------------------------

    onRemoteStream((stream) => {
      if (!mounted) return;

      console.log("");
      console.log(
        "",
        stream.getTracks().map((track) => ({
          kind: track.kind,
          id: track.id,
          enabled: track.enabled,
          readyState: track.readyState,
        }))
      );

      setRemoteStream(stream);
    });

    // -------------------------------------------------
    // ICE CANDIDATE
    // -------------------------------------------------

    const handleLocalIceCandidate = (candidate) => {
      if (!candidate) return;

      console.log("");

      socket.emit("webrtc-ice-candidate", {
        meetingId,
        candidate,
      });
    };

    onIceCandidate(handleLocalIceCandidate);

    // -------------------------------------------------
    // RECEIVE CANDIDATE ANSWER
    // -------------------------------------------------

    const handleAnswer = async ({ answer }) => {
      try {
        console.log("");

        if (!answer) {
          console.warn("");
          return;
        }

        await setRemoteDescription(answer);

        console.log("");
      } catch (error) {
        console.error(
          "",
          error
        );
      }
    };

    // -------------------------------------------------
    // RECEIVE CANDIDATE ICE
    // -------------------------------------------------

    const handleRemoteIceCandidate = async ({
      candidate,
    }) => {
      try {
        if (!candidate) return;

        console.log("");

        await addIceCandidate(candidate);

        console.log("");
      } catch (error) {
        console.error(
          "",
          error
        );
      }
    };

    // -------------------------------------------------
    // CANDIDATE JOINED
    // -------------------------------------------------
    // Do not create the WebRTC offer here.
    // The candidate is admitted before media is ready.
    // We wait for the explicit "candidate-ready" event
    // after the candidate camera/microphone tracks have
    // been added to the WebRTC peer connection.
    // -------------------------------------------------

    const handleParticipantJoined = ({
      role: joinedRole,
    }) => {
      console.log(
        "",
        joinedRole
      );

      if (joinedRole === "candidate") {
        console.log(
          ""
        );
      }
    };

    // -------------------------------------------------
    // CANDIDATE MEDIA READY
    // -------------------------------------------------

    const handleCandidateReady = async ({
      meetingId: readyMeetingId,
    }) => {
      if (!mounted) return;

      console.log(
        "",
        readyMeetingId
      );

      if (
        String(readyMeetingId || "").toUpperCase() !==
        String(meetingId || "").toUpperCase()
      ) {
        console.warn(
          ""
        );
        return;
      }

      try {
        setMeetingStatus("connecting");

        console.log(
          ""
        );

        console.log(
          ""
        );

        const offer = await createOffer();

        if (!offer) {
          console.error(
            ""
          );
          return;
        }

        console.log(
          ""
        );

        socket.emit("webrtc-offer", {
          meetingId,
          offer,
        });

        console.log(
          ""
        );

      } catch (error) {
        console.error(
          "",
          error
        );
      }
    };

    // -------------------------------------------------
    // MEETING JOINED
    // -------------------------------------------------

    const handleMeetingJoined = ({
      meetingId: joinedMeetingId,
      role: joinedRole,
    }) => {
      console.log(
        ""
      );

      console.log(
        "",
        joinedMeetingId
      );

      console.log(
        "",
        joinedRole
      );
      setMeetingStatus("waiting");
    };

    const handleJoinRequestReceived = ({ candidateSocketId }) => {
      console.log("", candidateSocketId);
      setCandidateJoinRequest({ candidateSocketId });
      setMeetingStatus("candidate-request");
    };

    const handleCandidateAccepted = () => {
      console.log("");
      setCandidateJoinRequest(null);
      setMeetingStatus("connecting");
    };

    const handleCandidateRejectedConfirmed = () => {
      console.log("");
      setCandidateJoinRequest(null);
      setMeetingStatus("waiting");
    };

    // -------------------------------------------------
    // AI RESULT FROM CANDIDATE
    // -------------------------------------------------
    // Python AI -> Candidate -> Socket.IO -> Node ->
    // Interviewer. The Node server is already forwarding
    // this event; this listener displays it here.
    const handleAIResult = ({
      meetingId: resultMeetingId,
      result,
    }) => {
      if (!mounted) return;

      const sameMeeting =
        String(resultMeetingId || "").toUpperCase() ===
        String(meetingId || "").toUpperCase();

      if (!sameMeeting) {
        console.warn(
          "",
          resultMeetingId
        );
        return;
      }

      if (!result) {
        console.warn("");
        return;
      }

      console.log("", result);

      setAiResult(result);
      setAiResultReceivedAt(new Date());
    };

    // -------------------------------------------------
    // MEETING ERROR
    // -------------------------------------------------

    const handleMeetingError = ({
      message,
    }) => {
      console.error(
        "",
        message
      );
    };

    // -------------------------------------------------
    // PARTICIPANT LEFT
    // -------------------------------------------------

    const handleParticipantLeft = ({
      role: leftRole,
    }) => {
      console.log(
        "",
        leftRole
      );

      setRemoteStream(null);
    };

    // -------------------------------------------------
    // SOCKET LISTENERS
    // -------------------------------------------------

    socket.on(
      "meeting-joined",
      handleMeetingJoined
    );

    socket.on(
      "meeting-error",
      handleMeetingError
    );

    socket.on("join-request-received", handleJoinRequestReceived);
    socket.on("candidate-accepted", handleCandidateAccepted);
    socket.on("candidate-rejected-confirmed", handleCandidateRejectedConfirmed);

    socket.on(
      "participant-joined",
      handleParticipantJoined
    );

    socket.on(
      "candidate-ready",
      handleCandidateReady
    );

    socket.on(
      "webrtc-answer",
      handleAnswer
    );

    socket.on(
      "webrtc-ice-candidate",
      handleRemoteIceCandidate
    );

    socket.on(
      "participant-left",
      handleParticipantLeft
    );

    socket.on(
      "ai-result",
      handleAIResult
    );

    // -------------------------------------------------
    // CONNECT SOCKET
    // -------------------------------------------------

    if (!socket.connected) {
      console.log(
        ""
      );

      socket.connect();
    }

    // -------------------------------------------------
    // JOIN MEETING
    // -------------------------------------------------

    const joinMeeting = () => {
      console.log(
        ""
      );

      socket.emit("join-meeting", {
        meetingId,
        role,
      });
    };

    if (socket.connected) {
      joinMeeting();
    } else {
      socket.once(
        "connect",
        joinMeeting
      );
    }

    // -------------------------------------------------
    // CLEANUP
    // -------------------------------------------------

    return () => {
      mounted = false;

      console.log(
        ""
      );

      socket.off(
        "meeting-joined",
        handleMeetingJoined
      );

      socket.off(
        "meeting-error",
        handleMeetingError
      );

      socket.off("join-request-received", handleJoinRequestReceived);
      socket.off("candidate-accepted", handleCandidateAccepted);
      socket.off("candidate-rejected-confirmed", handleCandidateRejectedConfirmed);

      socket.off(
        "participant-joined",
        handleParticipantJoined
      );

      socket.off(
        "candidate-ready",
        handleCandidateReady
      );

      socket.off(
        "webrtc-answer",
        handleAnswer
      );

      socket.off(
        "webrtc-ice-candidate",
        handleRemoteIceCandidate
      );

      socket.off(
        "participant-left",
        handleParticipantLeft
      );

      socket.off(
        "ai-result",
        handleAIResult
      );

      socket.off(
        "connect",
        joinMeeting
      );

      socket.disconnect();
    };
  }, [meetingId]);

  // =====================================================
  // CHAT
  // =====================================================

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        sender: "You",
        text: message,
      },
    ]);

    setMessage("");
  };

  // =====================================================
  // UI
  // =====================================================

  const acceptCandidate = () => {
    if (!candidateJoinRequest) return;
    console.log("");
    socket.emit("accept-candidate", { meetingId });
    setMeetingStatus("connecting");
  };

  const rejectCandidate = () => {
    if (!candidateJoinRequest) return;
    console.log("");
    socket.emit("reject-candidate", { meetingId });
  };

  // =====================================================
  // AI DISPLAY HELPERS
  // =====================================================

  const vision = aiResult?.vision || {};
  const audio = aiResult?.audio || {};
  const consensus = aiResult?.consensus || {};

  // Read the exact fields returned by the AI backend.
  const visionFaces = aiResult?.faces_detected ?? vision.faces_detected;
  const visionScore = consensus.vision_score ?? vision.vision_score;
  const realProbability = aiResult?.real_probability ?? vision.real_probability;
  const deepfakeProbability = aiResult?.deepfake_probability ?? vision.deepfake_probability;

  const audioScore = consensus.audio_score ?? audio.audio_trust_score;
  const voiceBonafide = audio.voice_bonafide_probability;
  const voiceSpoof = audio.voice_spoof_probability;
  const audioConsistency = audio.av_consistency_score;

  const consensusScore = consensus.final_trust_score;
  const consensusDisplay = consensus.status;
  const activeSignals = consensus.active_signals;

  const formatValue = (value, fallback = "N/A") => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    if (typeof value === "number") {
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }
    return String(value);
  };

  const formatProbability = (value) => {
    if (value === undefined || value === null || value === "") return "N/A";
    const number = Number(value);
    if (Number.isNaN(number)) return "N/A";
    return `${(number <= 1 ? number * 100 : number).toFixed(2)}%`;
  };

  return (
    <div className="w-screen h-screen bg-[#0B0F19] text-white overflow-hidden">

      {candidateJoinRequest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl"></div>
              <div>
                <h2 className="text-xl font-bold">Candidate wants to join</h2>
                <p className="text-sm text-gray-400">A candidate is waiting for your approval.</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#1F2937] p-4 mb-5">
              <p className="text-sm text-gray-400">Meeting</p>
              <p className="font-semibold mt-1">{meetingId}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={rejectCandidate}
                className="flex-1 rounded-xl border border-red-500/50 bg-red-950/50 px-4 py-3 font-semibold text-red-300 hover:bg-red-900/60"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={acceptCandidate}
                className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold hover:bg-green-700"
              >
                Accept & Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          NAVBAR
      ========================= */}

      <MeetingNavbar />

      {/* =========================
          MAIN MEETING AREA
      ========================= */}

      <main className="h-[calc(100vh-144px)] min-h-0 px-4 py-3 pb-4">

        <div className="grid grid-cols-12 gap-4 h-full min-h-0">

          {/* =========================
              VIDEO
          ========================= */}

          <section className="col-span-8 h-full min-h-0 min-w-0">

            <MainVideo
              remoteStream={remoteStream}
            />

          </section>

          {/* =========================
              AI STATUS
          ========================= */}

          <aside className="col-span-4 h-full min-h-0 min-w-0 overflow-y-auto pr-1">
            <div className="space-y-3 pb-2">

              <div className="bg-[#111827] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">AI Monitoring</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {aiResult ? "Latest candidate analysis received" : "Waiting for candidate AI analysis"}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${aiResult ? "text-green-400" : "text-yellow-400"}`}>
                    {aiResult ? "ANALYZED" : "WAITING"}
                  </span>
                </div>
                {aiResultReceivedAt && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    Last analysis: {aiResultReceivedAt.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="bg-[#111827] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400">Final AI Result</p>
                    <h3 className="text-base font-bold">Consensus Analysis</h3>
                  </div>
                  <span className={`text-xs font-semibold uppercase ${
                    consensusDisplay === "likely_real" ? "text-green-400" :
                    consensusDisplay === "uncertain" ? "text-yellow-400" :
                    consensusDisplay === "suspicious" ? "text-red-400" : "text-gray-400"
                  }`}>
                    {aiResult ? String(consensusDisplay || "processing").replace(/_/g, " ") : "Waiting"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Trust Score</p>
                    <p className="text-xl font-bold mt-1 text-purple-300">{formatValue(consensusScore)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Decision</p>
                    <p className="text-sm font-bold mt-2">{aiResult ? String(consensusDisplay || "processing").replace(/_/g, " ") : "Waiting"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold"></h3>
                    <p className="text-[10px] text-gray-400">Liveness & Deepfake Detection</p>
                  </div>
                  <span className={`text-[10px] font-semibold ${aiResult ? "text-green-400" : "text-yellow-400"}`}>
                    {aiResult ? "COMPLETE" : "WAITING"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Faces Detected</p>
                    <p className="text-base font-semibold mt-1">{formatValue(visionFaces)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Vision Score</p>
                    <p className="text-base font-semibold mt-1">{formatValue(visionScore)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Real Probability</p>
                    <p className="text-base font-semibold mt-1 text-green-300">{formatProbability(realProbability)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Deepfake Probability</p>
                    <p className="text-base font-semibold mt-1 text-red-300">{formatProbability(deepfakeProbability)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold"></h3>
                    <p className="text-[10px] text-gray-400">Vision-Based Final Decision</p>
                  </div>
                  <span className={`text-[10px] font-semibold ${aiResult ? "text-green-400" : "text-yellow-400"}`}>
                    {aiResult ? "COMPLETE" : "WAITING"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Vision Input</p>
                    <p className="text-base font-semibold mt-1">{formatValue(consensus.vision_score)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Vision Consensus</p>
                    <p className="text-base font-semibold mt-1">{formatValue(consensus.final_trust_score)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Final Trust Score</p>
                    <p className="text-base font-semibold mt-1 text-purple-300">{formatValue(consensus.final_trust_score)}</p>
                  </div>
                  <div className="bg-[#1F2937] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400">Status</p>
                    <p className="text-base font-semibold mt-1">{formatValue(consensus.status)}</p>
                  </div>
                </div>
                <div className="mt-2 bg-[#1F2937] rounded-xl px-3 py-2">
                  <p className="text-[10px] text-gray-400">Active Signals</p>
                  <p className="text-[10px] text-gray-200 mt-1">
                    {Array.isArray(activeSignals) ? activeSignals.join(" + ") : formatValue(activeSignals)}
                  </p>
                </div>
              </div>

              {aiResult && (
                <details className="bg-[#111827] border border-gray-700 rounded-2xl p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-400">View Raw AI Result</summary>
                  <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-black/30 p-3 text-[10px] text-gray-400 whitespace-pre-wrap">{JSON.stringify(aiResult, null, 2)}</pre>
                </details>
              )}
            </div>
          </aside>

        </div>

      </main>

      {/* =========================
          MESSAGES
      ========================= */}

      {showMessages && (
        <div className="fixed top-0 right-0 bottom-20 w-96 bg-[#111827] border-l border-gray-700 shadow-2xl z-50">

          <div className="flex flex-col h-full">

            <div className="flex justify-between items-center p-4 border-b border-gray-700">

              <h2 className="text-xl font-semibold">
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

              {messages.map((msg, index) => (
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
              ))}

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
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={handleSend}
                  className="bg-purple-600 hover:bg-purple-700 px-5 rounded-lg font-medium"
                >
                  Send
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          PARTICIPANTS
      ========================= */}

      {showParticipants && (
        <div className="fixed top-0 right-0 bottom-20 w-96 bg-[#111827] border-l border-gray-700 shadow-2xl z-50 flex flex-col">

          <div className="flex justify-between items-center p-5 border-b border-gray-700">

            <h2 className="text-xl font-bold">
              </h2>

            <button
              onClick={() =>
                setShowParticipants(false)
              }
              className="text-2xl text-gray-400 hover:text-red-400"
            >
              Ã—
            </button>

          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            <div className="flex items-center gap-4 bg-[#1F2937] rounded-xl p-4">

              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center font-bold text-lg">
                I
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-lg">
                  Interviewer
                </h3>

                <p className="text-gray-400 text-sm">
                  Host
                </p>

              </div>

              <span className="text-green-400 text-sm">
                </span>

            </div>

            <div className="flex items-center gap-4 bg-[#1F2937] rounded-xl p-4">

              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">
                C
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-lg">
                  Candidate
                </h3>

                <p className="text-gray-400 text-sm">
                  Candidate
                </p>

              </div>

              <span className="text-green-400 text-sm">
                </span>

            </div>

            <div className="bg-[#1F2937] rounded-xl p-5">

              <h3 className="font-semibold text-lg mb-3">
                Meeting Information
              </h3>

              <div className="space-y-2 text-gray-300">

                <div className="flex justify-between">
                  <span>Meeting ID</span>

                  <span>
                    {meetingId || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">

                  <span>
                    Encryption
                  </span>

                  <span className="text-green-400">
                    Enabled
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Status
                  </span>

                  <span className="text-green-400">
                    Connected
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          CONTROLS
      ========================= */}

      <MeetingControls
        showMessages={showMessages}
        setShowMessages={setShowMessages}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
      />

    </div>
  );
}

export default InterviewerMeetingRoom;






