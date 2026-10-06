import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaComments,
  FaUsers,
  FaPhoneSlash,
  FaStopCircle,
} from "react-icons/fa";

function MeetingControls({
  showMessages,
  setShowMessages,
  showParticipants,
  setShowParticipants,
  localStream,
  onCameraStatusChange,
}) {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const handleMicToggle = () => {
    const newMicState = !micOn;
    setMicOn(newMicState);
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = newMicState;
      });
    }
  };

  const handleCameraToggle = () => {
    const newCameraState = !cameraOn;
    setCameraOn(newCameraState);
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = newCameraState;
      });
    }
    if (onCameraStatusChange) {
      onCameraStatusChange(newCameraState);
    }
  };

  const handleScreenShare = async () => {
    try {
      if (!isSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        console.log("Screen sharing started", screenStream);
        setIsSharing(true);
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        if (screenVideoTrack) {
          screenVideoTrack.onended = () => {
            setIsSharing(false);
            console.log("Screen sharing stopped");
          };
        }
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const handleLeaveMeeting = () => {
    navigate("/meeting-ended");
  };

  const buttonClass = (active = true) =>
    `w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition flex-shrink-0 ${
      active
        ? "bg-[#1F2937] hover:bg-[#374151]"
        : "bg-red-600 hover:bg-red-700"
    }`;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 md:h-20 bg-[#111827]/98 backdrop-blur border-t border-gray-800 flex items-center justify-center z-50 px-3">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button onClick={handleMicToggle} className={buttonClass(micOn)} title={micOn ? "Turn microphone off" : "Turn microphone on"}>
          {micOn ? <FaMicrophone className="text-base md:text-lg text-white" /> : <FaMicrophoneSlash className="text-base md:text-lg text-white" />}
        </button>

        <button onClick={handleCameraToggle} className={buttonClass(cameraOn)} title={cameraOn ? "Turn camera off" : "Turn camera on"}>
          {cameraOn ? <FaVideo className="text-base md:text-lg text-white" /> : <FaVideoSlash className="text-base md:text-lg text-white" />}
        </button>

        <button onClick={handleScreenShare} className={buttonClass(true) + (isSharing ? " !bg-green-600 hover:!bg-green-700" : "")} title={isSharing ? "Stop screen sharing" : "Share screen"}>
          {isSharing ? <FaStopCircle className="text-base md:text-lg text-white" /> : <FaDesktop className="text-base md:text-lg text-white" />}
        </button>

        <button onClick={() => setShowMessages(!showMessages)} className={buttonClass(true)} title="Messages">
          <FaComments className="text-base md:text-lg text-white" />
        </button>

        <button onClick={() => setShowParticipants(!showParticipants)} className={buttonClass(true)} title="Participants">
          <FaUsers className="text-base md:text-lg text-white" />
        </button>

        <button onClick={handleLeaveMeeting} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition flex-shrink-0" title="Leave meeting">
          <FaPhoneSlash className="text-white text-lg md:text-xl" />
        </button>
      </div>
    </div>
  );
}

export default MeetingControls;
