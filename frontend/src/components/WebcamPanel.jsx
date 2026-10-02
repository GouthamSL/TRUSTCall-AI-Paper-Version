import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { analyzeFrame } from "../services/api";

function WebcamPanel({ setDetectionData }) {

  const webcamRef = useRef(null);

  const captureTimer = useRef(null);
  const warningTimer = useRef(null);

  const warningLevel = useRef(0);
  const cameraRunning = useRef(true);

  const meetingStarted = useRef(false);

  const cameraOffTimer = useRef(null);
  const cameraOffWarning = useRef(0);

  const [cameraOn, setCameraOn] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    cameraRunning.current = cameraOn;

    if (!cameraOn) return;

    captureTimer.current = setInterval(async () => {

      if (!cameraRunning.current) return;

      if (!webcamRef.current) return;

      const image = webcamRef.current.getScreenshot();

      if (!image) return;

      try {

        setLoading(true);

        const result = await analyzeFrame(image);

        if (!cameraRunning.current) return;

        console.log("Backend Response:", result);

        if (!result) return;

        setDetectionData(result);

        // ==========================
        // MULTIPLE PERSON DETECTION
        // ==========================

        if (result.faces_detected > 1) {

          if (!warningTimer.current) {

            warningLevel.current = 0;

            warningTimer.current = setInterval(() => {

              if (!cameraRunning.current) {

                clearInterval(warningTimer.current);
                warningTimer.current = null;
                warningLevel.current = 0;
                return;

              }

              warningLevel.current++;

              if (warningLevel.current === 1) {

                alert(
                  "⚠ WARNING 1\n\nMultiple persons detected.\nPlease ensure only one person is visible."
                );

              }

              else if (warningLevel.current === 2) {

                alert(
                  "🚨 FINAL WARNING\n\nMultiple persons are still detected."
                );

              }

              else {

                alert(
                  "❌ ACCESS BLOCKED\n\nMeeting terminated due to repeated multiple-person detection."
                );

                handleStop();

              }

            }, 2000);

          }

        }

        else {

          if (warningTimer.current) {

            clearInterval(warningTimer.current);
            warningTimer.current = null;

          }

          warningLevel.current = 0;

        }

      }

      catch (err) {

        console.error(err);

      }

      finally {

        if (cameraRunning.current)
          setLoading(false);

      }

    }, 2000);

    return () => {

      if (captureTimer.current) {
        clearInterval(captureTimer.current);
        captureTimer.current = null;
      }

      if (warningTimer.current) {
        clearInterval(warningTimer.current);
        warningTimer.current = null;
      }

      if (cameraOffTimer.current) {
        clearInterval(cameraOffTimer.current);
        cameraOffTimer.current = null;
      }

    };

  }, [cameraOn]);



  const handleStart = () => {

    meetingStarted.current = true;

    cameraRunning.current = true;

    warningLevel.current = 0;

    cameraOffWarning.current = 0;

    if (warningTimer.current) {
      clearInterval(warningTimer.current);
      warningTimer.current = null;
    }

    if (cameraOffTimer.current) {
      clearInterval(cameraOffTimer.current);
      cameraOffTimer.current = null;
    }

    setCameraOn(true);
    

  };



  const handleStop = () => {

    cameraRunning.current = false;

    if (meetingStarted.current) {

    if (!cameraOffTimer.current) {

      cameraOffWarning.current = 0;

      cameraOffTimer.current = setInterval(() => {

        cameraOffWarning.current++;

        if (cameraOffWarning.current === 1) {

          alert(
            "⚠ WARNING\n\nCamera is OFF.\nPlease turn your camera ON."
          );

        }

        else {

          alert(
            "❌ ACCESS BLOCKED\n\nMeeting terminated because the camera remained OFF."
          );

          clearInterval(cameraOffTimer.current);
          cameraOffTimer.current = null;

          meetingStarted.current = false;

        }

      },3000);

    }

  }

    if (captureTimer.current) {

      clearInterval(captureTimer.current);
      captureTimer.current = null;

    }

    if (warningTimer.current) {

      clearInterval(warningTimer.current);
      warningTimer.current = null;

    }

    warningLevel.current = 0;

    setCameraOn(false);

    setLoading(false);

    setDetectionData({

      status: "STOPPED",
      vision_score: 0,
      real_probability: 0,
      deepfake_probability: 0,
      faces_detected: 0,
      blink_detected: false,
      left_eye_open: false,
      right_eye_open: false,
      landmarks_detected: false,
      warningLevel: 0,
      blocked: false,

    });

  };



  return (

    <div className="h-full bg-slate-900 border border-slate-700 rounded-xl flex flex-col">

      <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">

        <div>

          <h2 className="text-xl font-bold">
            Live Camera
          </h2>

          <p className="text-xs text-slate-400">
            Real-Time Video Feed
          </p>

        </div>

        <span
          className={`font-semibold ${
            cameraOn ? "text-green-400" : "text-red-400"
          }`}
        >
          {cameraOn ? "● LIVE" : "● OFF"}
        </span>

      </div>



      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">

        {cameraOn ? (

          <Webcam
            ref={webcamRef}
            mirrored
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user",
            }}
          />

        ) : (

          <div className="text-slate-500 text-xl">
            Camera Stopped
          </div>

        )}

      </div>



      <div className="border-t border-slate-700 p-4">

        <div className="flex justify-between items-center">

          <span className="text-sm text-slate-400">
            {loading ? "Analyzing..." : "Ready"}
          </span>

          <div className="flex gap-3">

            <button
              onClick={handleStart}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
            >
              ▶ Start
            </button>

            <button
              onClick={handleStop}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
            >
              ■ Stop
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default WebcamPanel;