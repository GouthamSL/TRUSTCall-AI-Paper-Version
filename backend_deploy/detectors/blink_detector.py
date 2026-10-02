from math import sqrt


def euclidean_distance(p1, p2):
    return sqrt(
        (p1.x - p2.x) ** 2 +
        (p1.y - p2.y) ** 2
    )


LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]


class BlinkDetector:

    def __init__(self):
        # You can adjust this later after observing the EAR values
        self.EAR_THRESHOLD = 0.20

    def calculate_ear(self, eye_points, landmarks):

        p1 = landmarks.landmark[eye_points[0]]
        p2 = landmarks.landmark[eye_points[1]]
        p3 = landmarks.landmark[eye_points[2]]
        p4 = landmarks.landmark[eye_points[3]]
        p5 = landmarks.landmark[eye_points[4]]
        p6 = landmarks.landmark[eye_points[5]]

        vertical_1 = euclidean_distance(p2, p5)
        vertical_2 = euclidean_distance(p3, p6)
        horizontal = euclidean_distance(p1, p4)

        if horizontal == 0:
            return 0.0

        ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
        return ear

    def detect(self, landmarks):

        if landmarks is None:
            return {
                "blink_detected": False,
                "left_eye_open": False,
                "right_eye_open": False
            }

        left_ear = self.calculate_ear(LEFT_EYE, landmarks)
        right_ear = self.calculate_ear(RIGHT_EYE, landmarks)

        # Debug output
        print("=" * 50)
        print(f"Left EAR  : {left_ear:.3f}")
        print(f"Right EAR : {right_ear:.3f}")
        print(f"Threshold : {self.EAR_THRESHOLD:.3f}")

        left_eye_open = left_ear > self.EAR_THRESHOLD
        right_eye_open = right_ear > self.EAR_THRESHOLD

        print(f"Left Eye Open  : {left_eye_open}")
        print(f"Right Eye Open : {right_eye_open}")

        blink_detected = not (left_eye_open and right_eye_open)

        print(f"Blink Detected : {blink_detected}")
        print("=" * 50)

        return {
            "blink_detected": blink_detected,
            "left_eye_open": left_eye_open,
            "right_eye_open": right_eye_open
        }