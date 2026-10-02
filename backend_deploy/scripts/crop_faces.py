import cv2
import os
from pathlib import Path
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from detectors.face_detector import FaceDetector
from detectors.face_cropper import FaceCropper


BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_REAL = BASE_DIR / "datasets" / "frames" / "real"
INPUT_FAKE = BASE_DIR / "datasets" / "frames" / "fake"

OUTPUT_REAL = BASE_DIR / "datasets" / "cropped_faces" / "real"
OUTPUT_FAKE = BASE_DIR / "datasets" / "cropped_faces" / "fake"

os.makedirs(OUTPUT_REAL, exist_ok=True)
os.makedirs(OUTPUT_FAKE, exist_ok=True)


detector = FaceDetector()
cropper = FaceCropper()


def process_folder(input_folder, output_folder):

    images = sorted(os.listdir(input_folder))

    for image_name in images:

        image_path = input_folder / image_name

        frame = cv2.imread(str(image_path))

        if frame is None:
            print(f"Skipping {image_name}")
            continue

        result = detector.detect(frame)

        if result["faces_detected"] == 0:
            print(f"No face found in {image_name}")
            continue

        detection = result["detections"][0]

        face = cropper.crop_face(frame, detection)

        save_path = output_folder / image_name

        cv2.imwrite(str(save_path), face)

        print(f"Saved: {save_path.name}")


print("Processing REAL frames...")
process_folder(INPUT_REAL, OUTPUT_REAL)

print("\nProcessing FAKE frames...")
process_folder(INPUT_FAKE, OUTPUT_FAKE)

print("\nFace cropping completed.")