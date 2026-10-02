import random
import shutil
from pathlib import Path

random.seed(42)

BASE_DIR = Path(__file__).resolve().parent.parent

SOURCE = BASE_DIR / "datasets" / "cropped_faces"

TRAIN = BASE_DIR / "datasets" / "train"
TEST = BASE_DIR / "datasets" / "test"

# Create folders
for folder in [
    TRAIN / "real",
    TRAIN / "fake",
    TEST / "real",
    TEST / "fake",
]:
    folder.mkdir(parents=True, exist_ok=True)


def split_class(class_name):

    source_folder = SOURCE / class_name

    images = list(source_folder.glob("*"))

    random.shuffle(images)

    split_index = int(len(images) * 0.8)

    train_images = images[:split_index]
    test_images = images[split_index:]

    print(f"\n{class_name.upper()}")

    print(f"Training : {len(train_images)}")

    print(f"Testing  : {len(test_images)}")

    for img in train_images:
        shutil.copy2(
            img,
            TRAIN / class_name / img.name
        )

    for img in test_images:
        shutil.copy2(
            img,
            TEST / class_name / img.name
        )


split_class("real")
split_class("fake")

print("\nDataset Split Completed Successfully")