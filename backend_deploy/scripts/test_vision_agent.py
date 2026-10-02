import sys
from pathlib import Path
import cv2

# Add backend folder to Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from agents.vision_agent import VisionAgent

# Initialize Vision Agent
vision_agent = VisionAgent()

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Could not open webcam.")
    exit()

print("===========================================")
print(" TRUSTCall AI - Vision Agent Test Started")
print(" Press 'Q' to Quit")
print("===========================================")

# Store previous status to avoid printing every frame
last_status = None

while True:

    ret, frame = cap.read()

    if not ret:
        print("Failed to capture frame.")
        break

    # Analyze current frame
    result = vision_agent.analyze_frame(frame)

    # Print only when status changes
    if result["status"] != last_status:

        print("\n-------------------------------------------")
        print(f"Status            : {result['status']}")
        print(f"Faces Detected    : {result['faces_detected']}")
        print(f"Landmarks         : {result['landmarks_detected']}")
        print(f"Blink Detected    : {result['blink_detected']}")
        print(f"Left Eye Open     : {result['left_eye_open']}")
        print(f"Right Eye Open    : {result['right_eye_open']}")
        print(f"Trust Score       : {result['vision_score']}")
        print(f"Real Probability  : {result['real_probability']}")
        print(f"Fake Probability  : {result['deepfake_probability']}")
        print("-------------------------------------------")

        last_status = result["status"]

    # Display webcam
    cv2.imshow("TRUSTCall AI - Vision Agent", frame)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()