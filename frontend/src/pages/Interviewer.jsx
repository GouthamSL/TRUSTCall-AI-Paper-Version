import { useState } from "react";
import { createMeeting } from "../services/meetingApi";
import LiveMeeting from "./LiveMeeting";

export default function Interviewer({ onBack }) {
  const [step, setStep] = useState(1);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "Software Engineer Interview",
    interviewerName: "",
    interviewerEmail: "",
    date: "",
    time: "",
    duration: "30 Minutes",
    interviewType: "Technical Interview",
    aiMonitoring: true
  });

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function generateMeeting() {
    setLoading(true);

    try {
      const result = await createMeeting();
      setMeeting({
        ...result.meeting,
        ...form
      });
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Unable to create meeting. Make sure the communication server is running.");
    } finally {
      setLoading(false);
    }
  }

  function startMeeting() {
    setStep(4);
  }

  function generateAnother() {
    setMeeting(null);
    setStep(1);
  }

  if (step === 4 && meeting) {
    return (
      <LiveMeeting
        meetingId={meeting.meetingId}
        role="interviewer"
        onBack={onBack}
      />
    );
  }

  return (
    <div className="tc-app">

      <header className="tc-header">
        <div className="tc-brand">
          <div className="tc-logo">◆</div>
          <div>
            <div className="tc-brand-name">TRUSTCall <span>AI</span></div>
            <div className="tc-brand-subtitle">Meeting Generation</div>
          </div>
        </div>

        <div className="tc-header-right">
          <div>
            <small>Interviewer ID</small>
            <strong>TC-8453AB</strong>
          </div>

          <div>
            <small>Interview Duration</small>
            <strong className="green">00:30:00</strong>
          </div>
        </div>
      </header>

      <div className="tc-stepbar">
        <div className={step >= 1 ? "active" : ""}>
          <span>1</span> Generate Meeting
        </div>
        <div className={step >= 2 ? "active" : ""}>
          <span>2</span> Meeting Created
        </div>
        <div className={step >= 3 ? "active" : ""}>
          <span>3</span> Start Confirmation
        </div>
        <div className={step >= 4 ? "active" : ""}>
          <span>4</span> Interview Room
        </div>
      </div>

      <main className="tc-content">

        {step === 1 && (
          <div className="tc-two-column">

            <section className="tc-card">
              <h1>Generate Meeting</h1>
              <p className="tc-muted">
                Enter meeting details to create a new interview session.
              </p>

              <label>Meeting Title</label>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />

              <label>Interviewer Name</label>
              <input
                placeholder="Enter interviewer name"
                value={form.interviewerName}
                onChange={(e) =>
                  updateField("interviewerName", e.target.value)
                }
              />

              <label>Interviewer Email</label>
              <input
                type="email"
                placeholder="Enter interviewer email"
                value={form.interviewerEmail}
                onChange={(e) =>
                  updateField("interviewerEmail", e.target.value)
                }
              />

              <div className="tc-row">
                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </div>

                <div>
                  <label>Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => updateField("time", e.target.value)}
                  />
                </div>
              </div>

              <div className="tc-row">
                <div>
                  <label>Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) =>
                      updateField("duration", e.target.value)
                    }
                  >
                    <option>30 Minutes</option>
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label>Interview Type</label>
                  <select
                    value={form.interviewType}
                    onChange={(e) =>
                      updateField("interviewType", e.target.value)
                    }
                  >
                    <option>Technical Interview</option>
                    <option>HR Interview</option>
                    <option>Behavioral Interview</option>
                  </select>
                </div>
              </div>

              <div className="tc-ai-toggle">
                <div>
                  <strong>AI Monitoring</strong>
                  <p>
                    AI will monitor the interview for safety and authenticity.
                  </p>
                </div>

                <button
                  className={form.aiMonitoring ? "toggle on" : "toggle"}
                  onClick={() =>
                    updateField("aiMonitoring", !form.aiMonitoring)
                  }
                >
                  <span />
                </button>
              </div>

              <button
                className="tc-primary"
                onClick={generateMeeting}
                disabled={loading}
              >
                {loading ? "Generating..." : "🔗 Generate Meeting Link"}
              </button>
            </section>

            <aside className="tc-preview">
              <h2>Meeting Preview</h2>

              <div className="tc-preview-card">
                <div className="tc-preview-icon">✓</div>
                <h3>TRUSTCall AI Interview</h3>

                <div className="tc-preview-item">
                  <span>Meeting Title</span>
                  <strong>{form.title || "Not specified"}</strong>
                </div>

                <div className="tc-preview-item">
                  <span>Interview Type</span>
                  <strong>{form.interviewType}</strong>
                </div>

                <div className="tc-preview-item">
                  <span>Duration</span>
                  <strong>{form.duration}</strong>
                </div>

                <div className="tc-preview-item">
                  <span>AI Monitoring</span>
                  <strong className="green">
                    {form.aiMonitoring ? "Enabled" : "Disabled"}
                  </strong>
                </div>

                <div className="tc-included">
                  <strong>What's Included</strong>
                  <p>✓ Vision Agent</p>
                  <p>✓ Audio Agent</p>
                  <p>✓ Consensus Agent</p>
                  <p>✓ End-to-End Encrypted Communication</p>
                </div>
              </div>
            </aside>

          </div>
        )}

        {step === 2 && meeting && (
          <section className="tc-center-card">

            <div className="tc-success">✓</div>

            <h1>Meeting Link Created!</h1>

            <p className="tc-muted">
              Share the link with the candidate to join the interview.
            </p>

            <div className="tc-meeting-id">
              <small>Meeting ID</small>
              <strong>{meeting.meetingId}</strong>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(meeting.meetingId)
                }
              >
                Copy
              </button>
            </div>

            <div className="tc-link-box">
              <div>
                <small>Meeting Link</small>
                <strong>
                  http://localhost:5173/?meeting={meeting.meetingId}
                </strong>
              </div>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `http://localhost:5173/?meeting=${meeting.meetingId}`
                  )
                }
              >
                Copy Link
              </button>
            </div>

            <div className="tc-details">
              <p><span>Meeting Title</span>{meeting.title}</p>
              <p><span>Interviewer</span>{meeting.interviewerName || "Interviewer"}</p>
              <p><span>Interview Type</span>{meeting.interviewType}</p>
              <p><span>Duration</span>{meeting.duration}</p>
              <p><span>AI Monitoring</span><b className="green">Enabled</b></p>
            </div>

            <div className="tc-actions">
              <button
                className="tc-secondary"
                onClick={generateAnother}
              >
                ↻ Generate Another Meeting
              </button>

              <button
                className="tc-primary"
                onClick={() => setStep(3)}
              >
                ▶ Start Meeting
              </button>
            </div>

          </section>
        )}

        {step === 3 && meeting && (
          <section className="tc-center-card">

            <div className="tc-camera-icon">▣</div>

            <h1>Ready to Start Interview?</h1>

            <p className="tc-muted">
              The meeting has been created successfully.
            </p>

            <p className="tc-muted">
              Candidates can join using the generated meeting link.
            </p>

            <div className="tc-confirm-id">
              Meeting ID: <strong>{meeting.meetingId}</strong>
            </div>

            <div className="tc-actions">
              <button
                className="tc-primary"
                onClick={startMeeting}
              >
                ▶ Start Interview
              </button>

              <button
                className="tc-secondary"
                onClick={() => setStep(2)}
              >
                Cancel
              </button>
            </div>

          </section>
        )}

      </main>
    </div>
  );
}
