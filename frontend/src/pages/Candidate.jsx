import { useEffect, useRef, useState } from "react";
import { checkMeeting } from "../services/meetingApi";
import LiveMeeting from "./LiveMeeting";

export default function Candidate({ onBack, initialMeetingId = "" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [meetingId, setMeetingId] = useState(initialMeetingId);
  const [displayName, setDisplayName] = useState("");
  const [joined, setJoined] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraReady(stream.getVideoTracks().length > 0);
        setMicReady(stream.getAudioTracks().length > 0);
      } catch (err) {
        console.error(err);
        setError("Please allow camera and microphone access.");
      }
    }

    startPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function joinMeeting() {
    const id = meetingId.trim().toUpperCase();

    if (!id) {
      setError("Enter the Meeting ID.");
      return;
    }

    if (!displayName.trim()) {
      setError("Enter your name.");
      return;
    }

    try {
      await checkMeeting(id);
      setMeetingId(id);
      setError("");
      setJoined(true);
    } catch {
      setError("Meeting not found. Please check the Meeting ID.");
    }
  }

  if (joined) {
    return (
      <LiveMeeting
        meetingId={meetingId}
        role="candidate"
        displayName={displayName}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="candidate-page">

      <header className="candidate-header">
        <div className="tc-brand">
          <div className="tc-logo">◆</div>
          <div className="tc-brand-name">
            TRUSTCall <span>AI</span>
          </div>
        </div>

        <div className="encrypted">
          🔒 End-to-End Encrypted
        </div>
      </header>

      <main className="candidate-content">

        <div className="candidate-heading">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>

          <h1>
            Welcome, <span>Candidate</span> 👋
          </h1>

          <p>
            You're all set! Check your devices before joining the interview.
          </p>
        </div>

        <div className="candidate-grid">

          <section>

            <div className="candidate-card">

              <h2>📹 Camera Preview</h2>

              <div className="camera-preview">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                />

                {!cameraReady && (
                  <div className="camera-message">
                    Camera preview unavailable
                  </div>
                )}
              </div>

            </div>

            <div className="candidate-card">
              <h2>✓ Meeting Checklist</h2>

              <div className="check-item">
                <span className="check">✓</span>
                <div>
                  <strong>Camera</strong>
                  <small>
                    {cameraReady ? "Detected and ready" : "Checking..."}
                  </small>
                </div>
              </div>

              <div className="check-item">
                <span className="check">✓</span>
                <div>
                  <strong>Microphone</strong>
                  <small>
                    {micReady ? "Detected and ready" : "Checking..."}
                  </small>
                </div>
              </div>

              <div className="check-item">
                <span className="check">✓</span>
                <div>
                  <strong>Internet Connection</strong>
                  <small>Connection will be checked during joining</small>
                </div>
              </div>

              <div className="check-item">
                <span className="check">✓</span>
                <div>
                  <strong>Browser Support</strong>
                  <small>WebRTC supported</small>
                </div>
              </div>
            </div>

            <div className="join-area">

              <input
                className="candidate-input"
                placeholder="Meeting ID  e.g. TC-8453AB"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />

              <input
                className="candidate-input"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              {error && (
                <div className="candidate-error">
                  {error}
                </div>
              )}

              <button
                className="candidate-join"
                onClick={joinMeeting}
              >
                📹 Join Meeting
              </button>

              <small>🔒 Your connection is secure and encrypted</small>

            </div>

          </section>

          <aside>

            <div className="candidate-card">
              <h2>ⓘ Meeting Information</h2>

              <div className="info-row">
                <span>Meeting ID</span>
                <strong>{meetingId || "Not entered"}</strong>
              </div>

              <div className="info-row">
                <span>Interviewer</span>
                <strong>TRUSTCall AI</strong>
              </div>

              <div className="info-row">
                <span>Interview Type</span>
                <strong>Technical Interview</strong>
              </div>

              <div className="info-row">
                <span>Duration</span>
                <strong>30 Minutes</strong>
              </div>
            </div>

            <div className="candidate-card">
              <h2>⚙ Device Settings</h2>

              <div className="setting-row">
                <span>Camera</span>
                <strong>Default Camera</strong>
              </div>

              <div className="setting-row">
                <span>Microphone</span>
                <strong>Default Microphone</strong>
              </div>

              <div className="setting-row">
                <span>Speaker</span>
                <strong>Default Speaker</strong>
              </div>
            </div>

            <div className="candidate-card">
              <h2>💡 Tips for a Great Interview</h2>

              <p>• Ensure good lighting on your face</p>
              <p>• Stay in a quiet environment</p>
              <p>• Look at the camera while speaking</p>
              <p>• Keep your resume handy</p>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
