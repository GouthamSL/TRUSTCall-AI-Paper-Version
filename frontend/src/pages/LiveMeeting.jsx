import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SIGNALING_URL = "http://localhost:3001";

export default function LiveMeeting({ meetingId, role, onBack }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [participant, setParticipant] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (!mounted) return;

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const socket = io(SIGNALING_URL);
        socketRef.current = socket;

        socket.on("connect", () => {
          setConnected(true);

          socket.emit("join-meeting", {
            meetingId,
            role
          });
        });

        socket.on("meeting-error", ({ message }) => {
          alert(message);
        });

        socket.on("participant-joined", async ({ role: joinedRole }) => {
          setParticipant(true);

          if (joinedRole !== role) {
            await createPeerConnection(true);
          }
        });

        socket.on("webrtc-offer", async ({ offer }) => {
          setParticipant(true);

          await createPeerConnection(false);

          const peer = peerRef.current;

          await peer.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("webrtc-answer", {
            meetingId,
            answer
          });
        });

        socket.on("webrtc-answer", async ({ answer }) => {
          const peer = peerRef.current;

          if (peer) {
            await peer.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        });

        socket.on("webrtc-ice-candidate", async ({ candidate }) => {
          const peer = peerRef.current;

          if (peer && candidate) {
            try {
              await peer.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (error) {
              console.error("ICE error:", error);
            }
          }
        });

        socket.on("participant-left", () => {
          setParticipant(false);

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        });

        socket.on("meeting-ended", () => {
          alert("The meeting has ended.");
          cleanup();
          onBack();
        });
      } catch (error) {
        console.error("Camera/microphone error:", error);
        alert(
          "Camera or microphone permission is required for the interview."
        );
      }
    }

    async function createPeerConnection(isOfferer) {
      if (peerRef.current) {
        return peerRef.current;
      }

      const peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302"
          }
        ]
      });

      peerRef.current = peer;

      const stream = localStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });
      }

      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("webrtc-ice-candidate", {
            meetingId,
            candidate: event.candidate
          });
        }
      };

      peer.onconnectionstatechange = () => {
        console.log(
          "WebRTC state:",
          peer.connectionState
        );
      };

      if (isOfferer) {
        const offer = await peer.createOffer();

        await peer.setLocalDescription(offer);

        socketRef.current.emit("webrtc-offer", {
          meetingId,
          offer
        });
      }

      return peer;
    }

    start();

    function cleanup() {
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        localStreamRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, [meetingId, role, onBack]);

  function toggleMic() {
    const stream = localStreamRef.current;

    if (!stream) return;

    const track = stream.getAudioTracks()[0];

    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }

  function toggleCamera() {
    const stream = localStreamRef.current;

    if (!stream) return;

    const track = stream.getVideoTracks()[0];

    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }

  function leaveMeeting() {
    if (socketRef.current) {
      if (role === "interviewer") {
        socketRef.current.emit("end-meeting", {
          meetingId
        });
      } else {
        socketRef.current.disconnect();
      }
    }

    onBack();
  }

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <strong>TRUSTCall AI</strong>

        <div>
          Meeting: <b>{meetingId}</b>
        </div>

        <div>
          {connected ? "🟢 Connected" : "🟡 Connecting..."}
        </div>
      </header>

      <main style={styles.main}>

        <div style={styles.videoGrid}>

          <div style={styles.videoCard}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={styles.video}
            />

            <div style={styles.label}>
              You ({role})
            </div>
          </div>

          <div style={styles.videoCard}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={styles.video}
            />

            {!participant && (
              <div style={styles.waiting}>
                Waiting for other participant...
              </div>
            )}

            <div style={styles.label}>
              {role === "interviewer"
                ? "Candidate"
                : "Interviewer"}
            </div>
          </div>

        </div>

        <div style={styles.controls}>

          <button onClick={toggleMic}>
            {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
          </button>

          <button onClick={toggleCamera}>
            {cameraOn ? "📹 Camera On" : "🚫 Camera Off"}
          </button>

          <button
            onClick={leaveMeeting}
            style={styles.leave}
          >
            {role === "interviewer"
              ? "End Interview"
              : "Leave Meeting"}
          </button>

        </div>

        <div style={styles.status}>
          <b>TRUSTCall AI Monitoring</b>
          <br />
          Vision Agent: Ready
          <br />
          Audio Agent: Ready
          <br />
          Consensus Agent: Ready
        </div>

      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111827",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    height: "70px",
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#030712"
  },
  main: {
    padding: "30px"
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  videoCard: {
    position: "relative",
    height: "65vh",
    background: "#000",
    borderRadius: "15px",
    overflow: "hidden"
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  label: {
    position: "absolute",
    bottom: "15px",
    left: "15px",
    padding: "8px 12px",
    background: "rgba(0,0,0,0.6)",
    borderRadius: "8px"
  },
  waiting: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa"
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "25px"
  },
  status: {
    marginTop: "25px",
    padding: "20px",
    background: "#1f2937",
    borderRadius: "12px",
    lineHeight: "1.8"
  },
  leave: {
    background: "#dc2626",
    color: "white",
    border: "none"
  }
};
