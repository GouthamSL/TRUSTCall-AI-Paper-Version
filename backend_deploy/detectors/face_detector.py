import cv2
import mediapipe as mp


class FaceDetector:

    def __init__(
        self,
        model_selection=1,
        min_detection_confidence=0.5
    ):
        self.model_selection = model_selection
        self.min_detection_confidence = min_detection_confidence

        self.mp_face_detection = mp.solutions.face_detection

        self.detector = self.mp_face_detection.FaceDetection(
            model_selection=self.model_selection,
            min_detection_confidence=self.min_detection_confidence
        )

    def detect(self, frame):

        if frame is None:
            return {
                "faces_detected": 0,
                "detections": []
            }

        if not isinstance(frame, type(None)) and frame.size == 0:
            return {
                "faces_detected": 0,
                "detections": []
            }

        # OpenCV uses BGR.
        # MediaPipe expects RGB.
        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        results = self.detector.process(
            rgb_frame
        )

        detections = []

        if results.detections is not None:
            detections = list(
                results.detections
            )

        print()
        print("========== FACE DETECTOR ==========")
        print(f"Frame Shape : {frame.shape}")
        print(f"Frame Type  : {frame.dtype}")
        print(
            f"Faces Detected : {len(detections)}"
        )

        if len(detections) == 0:
            print(
                "No faces detected by MediaPipe."
            )

        print(
            "==================================="
        )

        return {
            "faces_detected": len(detections),
            "detections": detections
        }

    def __del__(self):
        try:
            if hasattr(self, "detector"):
                self.detector.close()
        except Exception:
            pass