import cv2
import mediapipe as mp
import time
import math

print("Starting TRUSTCall AI EAR Blink Agent...")

# Initialize Face Mesh
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Open webcam
cap = cv2.VideoCapture(0)

# Blink variables
blink_count = 0
blink_detected = False

last_blink_time = time.time()

blink_status = "NORMAL"

blink_violation_count = 0


def euclidean_distance(point1, point2):
    return math.sqrt(
        (point1.x - point2.x) ** 2 +
        (point1.y - point2.y) ** 2
    )


while True:

    success, frame = cap.read()

    if not success:
        print("Cannot access webcam")
        break

    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:

        for face_landmarks in results.multi_face_landmarks:

            # Left eye landmarks
            p1 = face_landmarks.landmark[33]
            p2 = face_landmarks.landmark[159]
            p3 = face_landmarks.landmark[158]
            p4 = face_landmarks.landmark[133]
            p5 = face_landmarks.landmark[153]
            p6 = face_landmarks.landmark[145]

            # EAR calculation
            vertical_1 = euclidean_distance(p2, p6)
            vertical_2 = euclidean_distance(p3, p5)

            horizontal = euclidean_distance(p1, p4)

            ear = (
                vertical_1 + vertical_2
            ) / (2.0 * horizontal)

            # Blink threshold
            if ear < 0.23:

                if not blink_detected:

                    blink_detected = True

            else:

                if blink_detected:

                    blink_count += 1

                    last_blink_time = time.time()

                    blink_status = "NORMAL"

                    blink_detected = False

            # Display EAR
            cv2.putText(
                frame,
                f"EAR: {ear:.2f}",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

    # TRUSTCall AI monitoring logic
    elapsed = time.time() - last_blink_time

    if elapsed > 20:

        blink_status = "SUSPICIOUS"

        blink_violation_count = 1

    elif elapsed > 10:

        blink_status = "MONITORING"

    else:

        blink_status = "NORMAL"

    # Display blink count
    cv2.putText(
        frame,
        f"Blinks: {blink_count}",
        (20, 100),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (255, 0, 0),
        2
    )

    # Display status
    cv2.putText(
        frame,
        f"Status: {blink_status}",
        (20, 150),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 0, 255),
        2
    )

    # Display violations
    cv2.putText(
        frame,
        f"Violations: {blink_violation_count}",
        (20, 200),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 255),
        2
    )

    cv2.imshow(
        "TRUSTCall AI - EAR Blink Agent",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()

cv2.destroyAllWindows()