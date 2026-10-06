import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CameraSelector from "../components/device/CameraSelector";
import DevicePreview from "../components/device/DevicePreview";

import { getAvailableCameras } from "../services/deviceService";

function DeviceSetup() {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [loading, setLoading] = useState(true);

  /*
  =========================================================
  LOAD AVAILABLE CAMERAS
  =========================================================
  */

  useEffect(() => {
    async function loadCameras() {
      try {
        console.log("📷 Loading available cameras...");

        const devices = await getAvailableCameras();

        console.log(
          "📷 Cameras detected:",
          devices
        );

        setCameras(devices);

        /*
        -----------------------------------------------------
        Restore previously selected camera if available.
        This is useful when the candidate returns to setup.
        -----------------------------------------------------
        */

        const savedCamera =
          localStorage.getItem("selectedCamera");

        const savedCameraExists = devices.some(
          (device) =>
            device.deviceId === savedCamera
        );

        if (
          savedCamera &&
          savedCameraExists
        ) {
          setSelectedCamera(savedCamera);

          console.log(
            "📷 Restored selected camera:",
            savedCamera
          );
        } else if (devices.length > 0) {
          /*
          ---------------------------------------------------
          Default to the first available camera.
          Candidate can change it to OBS Virtual Camera.
          ---------------------------------------------------
          */

          setSelectedCamera(
            devices[0].deviceId
          );

          console.log(
            "📷 Default camera selected:",
            devices[0].deviceId
          );
        }

      } catch (error) {
        console.error(
          "❌ Failed to load cameras:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadCameras();
  }, []);


  /*
  =========================================================
  JOIN MEETING
  =========================================================
  */

  const handleJoin = () => {

    if (!meetingId) {
      alert(
        "Meeting ID is missing. Please open the meeting link again."
      );
      return;
    }

    if (!selectedCamera) {
      alert(
        "Please select a camera before joining."
      );
      return;
    }

    /*
    ---------------------------------------------------------
    SAVE SELECTED CAMERA
    ---------------------------------------------------------
    */

    localStorage.setItem(
      "selectedCamera",
      selectedCamera
    );

    /*
    ---------------------------------------------------------
    SAVE MEETING ID
    ---------------------------------------------------------
    */

    localStorage.setItem(
      "pendingMeetingId",
      meetingId
    );

    sessionStorage.setItem(
      "pendingMeetingId",
      meetingId
    );

    /*
    ---------------------------------------------------------
    ENSURE CANDIDATE ROLE
    ---------------------------------------------------------
    */

    localStorage.setItem(
      "role",
      "Candidate"
    );

    sessionStorage.setItem(
      "role",
      "Candidate"
    );

    console.log(
      "========================================"
    );

    console.log(
      "🚀 CANDIDATE JOINING MEETING"
    );

    console.log(
      "🆔 Meeting ID:",
      meetingId
    );

    console.log(
      "📷 Selected Camera:",
      selectedCamera
    );

    console.log(
      "👤 Role: Candidate"
    );

    console.log(
      "========================================"
    );

    /*
    =========================================================
    IMPORTANT ROUTE
    =========================================================

    /meeting/:meetingId
        = EMAIL ENTRY → Candidate Dashboard

    /device-setup/:meetingId
        = CAMERA SELECTION

    /meeting-room/:meetingId
        = ACTUAL WEBRTC MEETING ROOM

    Therefore we MUST navigate to /meeting-room here.
    */

    navigate(
      `/meeting-room/${encodeURIComponent(
        meetingId
      )}`
    );
  };


  /*
  =========================================================
  UI
  =========================================================
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">

      <div className="max-w-6xl mx-auto py-10 px-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <h1 className="text-4xl font-bold">
          TRUSTCall AI
        </h1>

        <p className="text-gray-300 mt-2 mb-8">
          Device Setup
        </p>


        {/* =================================================
            MEETING INFORMATION
        ================================================= */}

        <div className="mb-6 bg-slate-800/80 border border-slate-700 rounded-xl p-5">

          <p className="text-sm text-gray-400">
            Meeting ID
          </p>

          <p className="text-xl font-semibold text-white mt-1">
            {meetingId || "Not available"}
          </p>

          <p className="text-sm text-green-400 mt-2">
            ✓ Candidate mode
          </p>

        </div>


        {/* =================================================
            CAMERA SETUP
        ================================================= */}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* CAMERA SELECTOR */}

          <CameraSelector
            cameras={cameras}
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
          />


          {/* CAMERA PREVIEW */}

          <DevicePreview
            selectedCamera={selectedCamera}
          />

        </div>


        {/* =================================================
            SELECTED CAMERA STATUS
        ================================================= */}

        <div className="mt-6 bg-slate-800/80 border border-slate-700 rounded-xl p-5">

          <p className="text-sm text-gray-400">
            Selected Camera
          </p>

          <p className="text-white font-medium mt-1">

            {loading
              ? "Detecting cameras..."
              : selectedCamera
                ? (
                    cameras.find(
                      (camera) =>
                        camera.deviceId ===
                        selectedCamera
                    )?.label ||
                    "Selected camera"
                  )
                : "No camera selected"}

          </p>

          {selectedCamera && (
            <p className="text-xs text-gray-500 mt-2 break-all">
              Device ID: {selectedCamera}
            </p>
          )}

        </div>


        {/* =================================================
            JOIN BUTTON
        ================================================= */}

        <div className="flex justify-end mt-8">

          <button
            onClick={handleJoin}
            disabled={
              loading ||
              !selectedCamera ||
              !meetingId
            }
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              loading ||
              !selectedCamera ||
              !meetingId
                ? "bg-gray-600 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:scale-105 hover:shadow-lg"
            }`}
          >
            {loading
              ? "Detecting Camera..."
              : "Join Meeting"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeviceSetup;