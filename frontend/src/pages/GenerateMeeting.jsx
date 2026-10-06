import api from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaEnvelope,
  FaVideo,
  FaRobot,
  FaBuilding,
} from "react-icons/fa";

function GenerateMeeting() {
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState({
    title: "",
    interviewer: "",
    company: "",
    email: "",
    date: "",
    time: "",
    duration: "30 Minutes",
    type: "Technical",
    aiMonitoring: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMeeting((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Check Meeting Title
    if (!meeting.title.trim()) {
      alert("Please enter the Meeting Title.");
      return;
    }

    // Check Interviewer Name
    if (!meeting.interviewer.trim()) {
      alert("Please enter the Interviewer Name.");
      return;
    }

    // Check Candidate Email
    if (!meeting.email.trim()) {
      alert("Please enter the Candidate Email.");
      return;
    }

    // Check Interview Date
    if (!meeting.date) {
      alert("Please select the Interview Date.");
      return;
    }

    // Check Interview Time
    if (!meeting.time) {
      alert("Please select the Interview Time.");
      return;
    }

    // Check Duration
    if (!meeting.duration) {
      alert("Please select the Interview Duration.");
      return;
    }

    // Check Company
    if (!meeting.company.trim()) {
      alert("Please enter the Company / Organization.");
      return;
    }

    try {
      const response = await api.post(
        "/api/meeting/create",
        meeting
      );

      // Backend response
      const createdMeeting = response.data.meeting;

      // Save complete meeting details
      localStorage.setItem(
        "meeting",
        JSON.stringify({
          ...createdMeeting,

          title: meeting.title,
          interviewer: meeting.interviewer,
          company: meeting.company,
          email: meeting.email,
          date: meeting.date,
          time: meeting.time,
          duration: meeting.duration,
          type: meeting.type,
          aiMonitoring: meeting.aiMonitoring,
        })
      );

      navigate("/meeting-created");
    } catch (err) {
      console.error(err);

      alert("Meeting creation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">

        <div className="flex items-center gap-3">

          <FaShieldAlt className="text-4xl text-purple-400" />

          <div>
            <h1 className="text-3xl font-bold">
              TRUSTCall AI
            </h1>

            <p className="text-gray-300">
              Generate Secure Interview Meeting
            </p>
          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* ========================= */}
        {/* LEFT - MEETING DETAILS */}
        {/* ========================= */}

        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold mb-8">
            Meeting Details
          </h2>

          <form onSubmit={handleGenerate}>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Meeting Title */}
              <div>

                <label className="block mb-2">
                  Meeting Title{" "}
                  <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={meeting.title}
                  onChange={handleChange}
                  placeholder="Technical Interview"
                  required
                  className="w-full p-3 rounded-lg bg-slate-700 outline-none"
                />

              </div>

              {/* Interviewer Name */}
              <div>

                <label className="block mb-2">
                  Interviewer Name{" "}
                  <span className="text-red-400">*</span>
                </label>

                <div className="relative">

                  <FaUserTie className="absolute left-3 top-4 text-gray-400" />

                  <input
                    type="text"
                    name="interviewer"
                    value={meeting.interviewer}
                    onChange={handleChange}
                    placeholder="John Smith"
                    required
                    className="w-full pl-10 p-3 rounded-lg bg-slate-700 outline-none"
                  />

                </div>

              </div>

              {/* Candidate Email */}
              <div>

                <label className="block mb-2">
                  Candidate Email{" "}
                  <span className="text-red-400">*</span>
                </label>

                <div className="relative">

                  <FaEnvelope className="absolute left-3 top-4 text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    value={meeting.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                    className="w-full pl-10 p-3 rounded-lg bg-slate-700 outline-none"
                  />

                </div>

              </div>

              {/* Interview Date */}
              <div>

                <label className="block mb-2">
                  Interview Date{" "}
                  <span className="text-red-400">*</span>
                </label>

                <div className="relative">

                  <FaCalendarAlt className="absolute left-3 top-4 text-gray-400" />

                  <input
                    type="date"
                    name="date"
                    value={meeting.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 rounded-lg bg-slate-700 outline-none"
                  />

                </div>

              </div>

              {/* Interview Time */}
              <div>

                <label className="block mb-2">
                  Interview Time{" "}
                  <span className="text-red-400">*</span>
                </label>

                <div className="relative">

                  <FaClock className="absolute left-3 top-4 text-gray-400" />

                  <input
                    type="time"
                    name="time"
                    value={meeting.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 rounded-lg bg-slate-700 outline-none"
                  />

                </div>

              </div>

              {/* Duration */}
              <div>

                <label className="block mb-2">
                  Duration{" "}
                  <span className="text-red-400">*</span>
                </label>

                <select
                  name="duration"
                  value={meeting.duration}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-slate-700 outline-none"
                >
                  <option value="30 Minutes">
                    30 Minutes
                  </option>

                  <option value="45 Minutes">
                    45 Minutes
                  </option>

                  <option value="60 Minutes">
                    60 Minutes
                  </option>

                  <option value="90 Minutes">
                    90 Minutes
                  </option>
                </select>

              </div>

              {/* Company / Organization */}
              <div>

                <label className="block mb-2">
                  Company / Organization{" "}
                  <span className="text-red-400">*</span>
                </label>

                <div className="relative">

                  <FaBuilding className="absolute left-3 top-4 text-gray-400" />

                  <input
                    type="text"
                    name="company"
                    value={meeting.company}
                    onChange={handleChange}
                    placeholder="Oracle, Microsoft, Google..."
                    required
                    className="w-full pl-10 p-3 rounded-lg bg-slate-700 outline-none"
                  />

                </div>

              </div>

            </div>

            {/* Generate Meeting Button */}
            <button
              type="submit"
              className="mt-10 w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-[1.02] transition text-lg font-semibold"
            >
              Generate Meeting Link
            </button>

          </form>

        </div>

        {/* ========================= */}
        {/* RIGHT - MEETING SUMMARY */}
        {/* ========================= */}

        <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold mb-6">
            Meeting Summary
          </h2>

          <div className="space-y-5">

            {/* AI Monitoring */}
            <div className="flex items-center gap-3">
              <FaRobot className="text-purple-400" />
              AI Monitoring Enabled
            </div>

            {/* Encryption */}
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-green-400" />
              End-to-End Encryption
            </div>

            {/* Secure Link */}
            <div className="flex items-center gap-3">
              <FaVideo className="text-blue-400" />
              Secure Meeting Link
            </div>

            {/* Protection */}
            <div className="bg-purple-900/40 rounded-xl p-5 mt-8">

              <h3 className="font-semibold mb-2">
                TRUSTCall Protection
              </h3>

              <p className="text-sm text-gray-300">
                Every meeting is protected using AI-powered
                identity verification, liveness detection,
                and secure encrypted communication.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default GenerateMeeting;