import cv2
import random
import mediapipe as mp

mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh


def analyze_frame(frame):

    try:

        if frame is None:
            return {
                "faces_detected": 0,
                "verification_failed": False,
                "deepfake_score": "--",
                "trust_score": "--",
                "status": "⚠ No frame received."
            }

        if frame.size == 0:
            return {
                "faces_detected": 0,
                "verification_failed": False,
                "deepfake_score": "--",
                "trust_score": "--",
                "status": "⚠ Empty frame received."
            }

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # Face Detection
        with mp_face_detection.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.5
        ) as face_detector:

            detection_results = face_detector.process(
                rgb_frame
            )

        # Face Mesh (for future orientation detection)
        verification_failed = False

        with mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as face_mesh:

            mesh_results = face_mesh.process(
                rgb_frame
            )

        face_count = 0

        if (
            detection_results
            and detection_results.detections
        ):

            face_count = len(
                detection_results.detections
            )

        print(
            "MediaPipe Faces:",
            face_count
        )

        print(
            "Face Mesh Detected:",
            mesh_results.multi_face_landmarks is not None
        )

        if mesh_results.multi_face_landmarks:

            landmarks = (
                mesh_results
                .multi_face_landmarks[0]
            )

            nose = landmarks.landmark[1]

            left_eye = landmarks.landmark[33]

            right_eye = landmarks.landmark[263]

            print(
                "Nose:",
                round(nose.x, 2),
                round(nose.y, 2)
            )

            print(
                "Left Eye:",
                round(left_eye.x, 2)
            )

            print(
               "Right Eye:",
                round(right_eye.x, 2)
            )

        if face_count == 0:

            verification_failed = True

            return {
                "faces_detected": 0,
                "verification_failed":
                    verification_failed,
                "deepfake_score": "--",
                "trust_score": "--",
                "status":
                    "⚠ No face detected."
            }

        # Placeholder scores
        deepfake_score = random.randint(
            10,
            30
        )

        trust_score = (
            100 - deepfake_score
        )

        return {
            "faces_detected":
                face_count,

            "verification_failed":
                verification_failed,

            "deepfake_score":
                deepfake_score,

            "trust_score":
                trust_score,

            "status":
                "REAL"
        }

    except Exception as e:

        print(
            "MediaPipe Error:",
            e
        )

        return {
            "faces_detected": -1,
            "verification_failed": False,
            "deepfake_score": "--",
            "trust_score": "--",
            "status":
                "⚠ Detection temporarily unavailable."
        }


def analyze_video(video_path):

    cap = cv2.VideoCapture(
        video_path
    )

    frame_count = 0

    total_faces = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        result = analyze_frame(
            frame
        )

        if (
            isinstance(
                result["faces_detected"],
                int
            )
            and result["faces_detected"] > 0
        ):

            total_faces += result[
                "faces_detected"
            ]

    cap.release()

    deepfake_score = random.randint(
        10,
        30
    )

    trust_score = (
        100 - deepfake_score
    )

    return {
        "frames_processed":
            frame_count,

        "faces_detected":
            total_faces,

        "deepfake_score":
            deepfake_score,

        "trust_score":
            trust_score,

        "status":
            "REAL"
    }