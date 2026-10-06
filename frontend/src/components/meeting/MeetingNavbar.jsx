import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaShieldAlt,
  FaLock,
  FaSignal,
} from "react-icons/fa";
import socket from "../../services/socketService";

function MeetingNavbar() {
  const { meetingId: urlMeetingId } = useParams();

  const [seconds, setSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);

  const meeting = JSON.parse(
    localStorage.getItem("meeting") || "null"
  );

  const meetingTitle =
    meeting?.title || "Interview Room";

  const meetingId =
    urlMeetingId || meeting?.meetingId || "N/A";

  const duration =
    meeting?.duration || "30 Minutes";

  /*
   * IMPORTANT:
   * Do NOT load startedAt from localStorage.
   *
   * The timer must start only when the server
   * tells us that the candidate has joined.
   */
  useEffect(() => {
    setStartedAt(null);
    setSeconds(0);

    const handleMeetingStarted = ({
      meetingId: startedMeetingId,
      startedAt: serverStartedAt,
    }) => {
      console.log(
        "================================="
      );
      console.log("MEETING OFFICIALLY STARTED");
      console.log("Meeting ID:", startedMeetingId);
      console.log("Started At:", serverStartedAt);
      console.log(
        "================================="
      );

      /*
       * Make sure this event belongs to
       * the current meeting.
       */
      if (
        startedMeetingId &&
        meetingId &&
        startedMeetingId !== meetingId
      ) {
        return;
      }

      setStartedAt(serverStartedAt);

      /*
       * Store only for reference.
       * The timer itself does NOT depend on localStorage.
       */
      const currentMeeting = JSON.parse(
        localStorage.getItem("meeting") || "{}"
      );

      localStorage.setItem(
        "meeting",
        JSON.stringify({
          ...currentMeeting,
          meetingId: startedMeetingId || meetingId,
          startedAt: serverStartedAt,
        })
      );
    };

    socket.on(
      "meeting-started",
      handleMeetingStarted
    );

    return () => {
      socket.off(
        "meeting-started",
        handleMeetingStarted
      );
    };
  }, [meetingId]);

  /*
   * Start timer only after the official
   * server timestamp is received.
   */
  useEffect(() => {
    if (!startedAt) {
      setSeconds(0);
      return;
    }

    const updateTimer = () => {
      const startTime =
        new Date(startedAt).getTime();

      const currentTime = Date.now();

      const elapsedSeconds = Math.max(
        0,
        Math.floor(
          (currentTime - startTime) / 1000
        )
      );

      setSeconds(elapsedSeconds);
    };

    updateTimer();

    const timer = setInterval(
      updateTimer,
      1000
    );

    return () => {
      clearInterval(timer);
    };
  }, [startedAt]);

  const formatTime = () => {
    const hrs = String(
      Math.floor(seconds / 3600)
    ).padStart(2, "0");

    const mins = String(
      Math.floor((seconds % 3600) / 60)
    ).padStart(2, "0");

    const secs = String(
      seconds % 60
    ).padStart(2, "0");

    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="w-full h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-8">

      {/* LEFT */}
      <div className="flex items-center gap-6">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-700 to-fuchsia-500 flex items-center justify-center">
            <FaShieldAlt className="text-white text-xl" />
          </div>

          <h1 className="text-3xl font-bold">
            TRUSTCall{" "}
            <span className="text-purple-500">
              AI
            </span>
          </h1>

        </div>

        <div className="h-10 w-px bg-gray-700"></div>

        <div className="flex items-center gap-2 text-green-400">

          <FaLock />

          <span className="text-lg">
            End-to-End Encrypted
          </span>

        </div>

      </div>

      {/* CENTER */}
      <div className="text-center">

        <div className="flex items-center justify-center gap-2">

          <div
            className={`w-3 h-3 rounded-full ${
              startedAt
                ? "bg-green-500 animate-pulse"
                : "bg-yellow-500"
            }`}
          ></div>

          <h2 className="text-3xl font-semibold">
            {meetingTitle}
          </h2>

        </div>

        <p className="text-gray-400 text-lg mt-1">
          Meeting ID : {meetingId}
        </p>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-8">

        {/* TIMER */}
        <div className="text-center">

          <h2 className="text-4xl font-bold">
            {formatTime()}
          </h2>

          <p className="text-gray-400">
            of {duration}
          </p>

        </div>

        {/* NETWORK */}
        <div className="flex items-center gap-3">

          <FaSignal className="text-green-400 text-2xl" />

          <div>

            <p className="text-gray-400">
              Network
            </p>

            <p className="text-green-400 font-semibold">
              Good
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MeetingNavbar;