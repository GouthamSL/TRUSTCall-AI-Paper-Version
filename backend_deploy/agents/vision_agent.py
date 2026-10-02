from detectors.face_detector import FaceDetector
from detectors.face_mesh_detector import FaceMeshDetector
from detectors.blink_detector import BlinkDetector
from detectors.face_cropper import FaceCropper
from detectors.deepfake_detector import DeepfakeDetector

class VisionAgent:

    def __init__(self):
        self.face_detector = FaceDetector()
        self.face_mesh_detector = FaceMeshDetector()
        self.blink_detector = BlinkDetector()
        self.face_cropper = FaceCropper()
        self.deepfake_detector = DeepfakeDetector()

    def analyze_frame(self, frame):

        # Step 1: Detect face
        face_result = self.face_detector.detect(frame)

        if face_result["faces_detected"] == 0:
            return {
                "faces_detected": 0,
                "landmarks_detected": False,
                "blink_detected": False,
                "left_eye_open": False,
                "right_eye_open": False,
                "real_probability": None,
                "deepfake_probability": None,
                "vision_score": None,
                "status": "NO_FACE"
            }

        cropped_face = self.face_cropper.crop_face(
            frame,
            face_result["detections"][0]
        )

        if cropped_face is None:
            return {
                "faces_detected": face_result["faces_detected"],
                "landmarks_detected": False,
                "blink_detected": False,
                "left_eye_open": False,
                "right_eye_open": False,
                "real_probability": None,
                "deepfake_probability": None,
                "vision_score": None,
                "status": "INVALID_FACE_CROP"
            }   


        deepfake_result = self.deepfake_detector.predict(cropped_face)

        # Step 2: Detect face landmarks
        mesh_result = self.face_mesh_detector.detect(frame)
        landmarks = mesh_result["landmarks"]

        if landmarks is None:
            blink_result = {
                "blink_detected": False,
                "left_eye_open": False,
                "right_eye_open": False
            }
        else:
            blink_result = self.blink_detector.detect(landmarks)

        return {
            "faces_detected": face_result["faces_detected"],
            "landmarks_detected": landmarks is not None,
            "blink_detected": blink_result["blink_detected"],
            "left_eye_open": blink_result["left_eye_open"],
            "right_eye_open": blink_result["right_eye_open"],

            "real_probability": deepfake_result["real_probability"],
            "deepfake_probability": deepfake_result["deepfake_probability"],
            "vision_score": deepfake_result["vision_score"],

            "status": "PROCESSING"
        }