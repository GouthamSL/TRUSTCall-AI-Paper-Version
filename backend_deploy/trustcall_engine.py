import cv2
import mediapipe as mp
import time
import math
import numpy as np

print("Starting TRUSTCall AI Engine...")

DEBUG_MODE = False

# MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection

face_detector = mp_face_detection.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.5
)

# --------------------------
# FACE MESH
# --------------------------
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera access is required to continue.")
    exit()

# Variables

# Blink Variables
blink_count = 0

blink_violations = 0

EAR_THRESHOLD = 0.23

EYE_AR_CONSEC_FRAMES = 2

COUNTER = 0

last_blink_time = time.time()

face_count = 0

notification = ""

notification_end_time = 0

admin_logs = []

status = "NORMAL"

multiple_face_warnings = 0
multiple_face_active = False

no_face_start = None

def euclidean_distance(p1, p2):

    return math.sqrt(
        (p1.x - p2.x) ** 2 +
        (p1.y - p2.y) ** 2
    )

while True:

    
        

    if time.time() > notification_end_time:
        notification = ""

    success, frame = cap.read()

    if not success:

        frame = 255 * np.ones((480, 640, 3), dtype=np.uint8)

        cv2.putText(
            frame,
            "Camera access is required to continue.",
            (20, 240),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

        cv2.imshow(
            "TRUSTCall AI Engine",
            frame
        )

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        continue

    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = face_detector.process(rgb)
    mesh_results = face_mesh.process(rgb)

    # --------------------------
    # FACE DETECTION
    # --------------------------
    face_count = 0

    if results and results.detections:

        face_count = len(results.detections)

        no_face_start = None

    else:

        if no_face_start is None:

            no_face_start = time.time()

        elif time.time() - no_face_start >= 5:

            if notification == "":

                notification = (
                    "Please remain visible to continue."
                )

                notification_end_time = time.time() + 5

            status = "SUSPICIOUS"

            admin_logs.append({
                "event": "NO_FACE",
                "time": time.strftime("%H:%M:%S")
            })


    # --------------------------
    # BLINK AGENT
    # --------------------------
    if mesh_results.multi_face_landmarks:

        for face_landmarks in mesh_results.multi_face_landmarks:

            p1 = face_landmarks.landmark[33]
            p2 = face_landmarks.landmark[159]
            p3 = face_landmarks.landmark[158]
            p4 = face_landmarks.landmark[133]
            p5 = face_landmarks.landmark[153]
            p6 = face_landmarks.landmark[145]

            vertical_1 = euclidean_distance(p2, p6)

            vertical_2 = euclidean_distance(p3, p5)

            horizontal = euclidean_distance(p1, p4)

            ear = (
                vertical_1 + vertical_2
            ) / (2.0 * horizontal)

            if ear < EAR_THRESHOLD:

                COUNTER += 1

            else:

                if COUNTER >= EYE_AR_CONSEC_FRAMES:

                    blink_count += 1

                    last_blink_time = time.time()

                COUNTER = 0


    # --------------------------
    # FACE OBSTRUCTION AGENT
    # --------------------------
    if mesh_results.multi_face_landmarks:

        for face_landmarks in mesh_results.multi_face_landmarks:

            landmark_count = len(
                face_landmarks.landmark
            )

            if landmark_count < 400:

                if not obstruction_active:

                    obstruction_active = True

                    notification = (
                        "Please ensure your face "
                        "is clearly visible."
                    )

                    notification_end_time = (
                        time.time() + 5
                    )

                    print(
                        "[ADMIN ALERT] Face obstruction detected."
                    )

            else:

                obstruction_active = False

    # ---------------------------------
    # MULTIPLE FACE AGENT
    # ---------------------------------
    if face_count > 1:

        if not multiple_face_active:

            multiple_face_active = True

            multiple_face_warnings += 1

            if multiple_face_warnings == 1:

                notification = (
                    "Multiple faces detected. "
                    "Please ensure only you are visible."
                )
                notification_end_time = time.time() + 5

            elif multiple_face_warnings == 2:

                notification = (
                    "Multiple faces detected again."
                )
                notification_end_time = time.time() + 5

            elif multiple_face_warnings >= 3:

                notification = (
                    "Examination irregularities detected."
                )
                notification_end_time = time.time() + 5

                status = "SUSPICIOUS"

                admin_logs.append({
                    "event": "MULTIPLE_FACE",
                    "time": time.strftime("%H:%M:%S")
                })

    else:

        multiple_face_active = False

        if face_count == 1 and multiple_face_warnings < 3:

            status = "NORMAL"

    # --------------------------
    # BLINK MONITORING
    # --------------------------
    elapsed = time.time() - last_blink_time

    if elapsed >= 10:

        blink_violations += 1

        last_blink_time = time.time()

        "[ADMIN ALERT] Unusual blink behaviour."

        if blink_violations >= 3:

            status = "SUSPICIOUS"

    # --------------------------
    # DASHBOARD
    # --------------------------
    if DEBUG_MODE:

        cv2.putText(
            frame,
            f"Faces: {face_count}",
            (20, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"Warnings: {multiple_face_warnings}",
            (20, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 0, 0),
            2
        )

        cv2.putText(
            frame,
            f"Status: {status}",
            (20, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

        cv2.putText(
            frame,
            f"Blinks: {blink_count}",
            (20, 200),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 0),
            2
        )

    # --------------------------
    # NOTIFICATIONS
    # --------------------------
    if notification:

        cv2.putText(
            frame,
            notification,
            (20, 250),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

    cv2.imshow(
        "TRUSTCall AI Engine",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

print("\n===== TRUSTCall Evidence Log =====")

for log in admin_logs:
    print(log)

cap.release()

cv2.destroyAllWindows()