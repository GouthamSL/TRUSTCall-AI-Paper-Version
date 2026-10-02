import sys
from pathlib import Path
import cv2

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from detectors.deepfake_detector import DeepfakeDetector

detector = DeepfakeDetector()

image_path = BASE_DIR / "datasets" / "cropped_faces" / "real" / "01__hugging_happy_4.jpg"

image = cv2.imread(str(image_path))

result = detector.predict(image)

print(result)