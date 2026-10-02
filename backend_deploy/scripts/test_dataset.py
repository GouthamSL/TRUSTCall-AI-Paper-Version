import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from datasets.deepfake_dataset import DeepfakeDataset

dataset = DeepfakeDataset(BASE_DIR / "datasets" / "cropped_faces")

print(f"Total Images : {len(dataset)}")

image, label = dataset[0]

print(f"First Image Size : {image.size}")
print(f"First Label : {label}")