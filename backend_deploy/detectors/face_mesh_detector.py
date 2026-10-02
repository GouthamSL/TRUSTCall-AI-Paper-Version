import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh


class FaceMeshDetector:

    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def detect(self, frame):

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = self.face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            print("✅ FaceMesh detected")
            return {
                "landmarks": results.multi_face_landmarks[0]
            }

        print("❌ FaceMesh NOT detected")

        return {
            "landmarks": None
        }