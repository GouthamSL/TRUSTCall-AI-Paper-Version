import { useEffect, useRef, useState } from "react";

function useCamera(deviceId) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let localStream = null;
    let cancelled = false;

    async function loadCamera() {
      console.log("📷 Camera Device ID:", deviceId || "DEFAULT CAMERA");

      try {
        // =====================================================
        // GET CAMERA + MICROPHONE
        // If deviceId is available, use that camera.
        // Otherwise use the browser's default camera.
        // =====================================================

        const constraints = {
          video: deviceId
            ? {
                deviceId: {
                  exact: deviceId,
                },
              }
            : true,
          audio: true,
        };

        console.log(
          "📷 Requesting camera with constraints:",
          constraints
        );

        localStream =
          await navigator.mediaDevices.getUserMedia(
            constraints
          );

        if (cancelled) {
          localStream
            .getTracks()
            .forEach((track) => track.stop());
          return;
        }

        console.log(
          "✅ Camera stream acquired:",
          localStream
        );

        console.log(
          "📹 Video tracks:",
          localStream.getVideoTracks().map((track) => ({
            label: track.label,
            enabled: track.enabled,
            readyState: track.readyState,
          }))
        );

        console.log(
          "🎤 Audio tracks:",
          localStream.getAudioTracks().map((track) => ({
            label: track.label,
            enabled: track.enabled,
            readyState: track.readyState,
          }))
        );

        setStream(localStream);

        // =====================================================
        // ATTACH STREAM TO VIDEO ELEMENT
        // =====================================================

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;

          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.autoplay = true;

          try {
            await videoRef.current.play();
            console.log("▶️ Local camera video started");
          } catch (playError) {
            console.warn(
              "⚠️ Video autoplay warning:",
              playError
            );
          }
        }
      } catch (error) {
        console.error(
          "❌ Camera Error:",
          error.name,
          error.message
        );

        if (error.name === "NotAllowedError") {
          console.error(
            "🚫 Camera/microphone permission was denied."
          );
        }

        if (error.name === "NotReadableError") {
          console.error(
            "⚠️ Camera is already being used by another application."
          );
        }

        if (error.name === "NotFoundError") {
          console.error(
            "⚠️ No camera device was found."
          );
        }
      }
    }

    loadCamera();

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      cancelled = true;

      if (localStream) {
        console.log("🛑 Stopping local camera");

        localStream
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [deviceId]);

  // =====================================================
  // KEEP VIDEO ELEMENT SYNCHRONIZED WITH STREAM
  // =====================================================

  useEffect(() => {
    if (!videoRef.current || !stream) {
      return;
    }

    if (videoRef.current.srcObject !== stream) {
      console.log(
        "🔗 Attaching camera stream to video element"
      );

      videoRef.current.srcObject = stream;
    }

    videoRef.current.muted = true;
    videoRef.current.playsInline = true;
    videoRef.current.autoplay = true;

    videoRef.current.play().catch((error) => {
      console.warn(
        "⚠️ Could not automatically play local video:",
        error
      );
    });
  }, [stream]);

  return {
    videoRef,
    stream,
  };
}

export default useCamera;