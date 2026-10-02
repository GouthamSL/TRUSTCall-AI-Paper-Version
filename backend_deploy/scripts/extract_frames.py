import cv2
import os
from pathlib import Path

# -----------------------------
# Dataset Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

REAL_PATH = BASE_DIR / "datasets" / "real"
FAKE_PATH = BASE_DIR / "datasets" / "fake"

OUTPUT_REAL = BASE_DIR / "datasets" / "frames" / "real"
OUTPUT_FAKE = BASE_DIR / "datasets" / "frames" / "fake"

os.makedirs(OUTPUT_REAL, exist_ok=True)
os.makedirs(OUTPUT_FAKE, exist_ok=True)


def extract_frames(video_folder, output_folder, frames_per_video=10):
    # Process videos in sorted order
    for video_name in sorted(os.listdir(video_folder)):

        video_prefix = os.path.splitext(video_name)[0]

        # Check whether this video has already been processed
        existing_frames = [
            f for f in os.listdir(output_folder)
            if f.startswith(video_prefix)
        ]

        if len(existing_frames) >= frames_per_video:
            print(f"Skipping {video_name} (already processed)")
            continue

        video_path = os.path.join(video_folder, video_name)

        cap = cv2.VideoCapture(str(video_path))

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if total_frames == 0:
            print(f"Skipping {video_name} (invalid video)")
            cap.release()
            continue

        step = max(total_frames // frames_per_video, 1)

        count = 0
        saved = 0

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            if count % step == 0:
                filename = f"{video_prefix}_{saved}.jpg"
                cv2.imwrite(str(output_folder / filename), frame)

                saved += 1

                if saved >= frames_per_video:
                    break

            count += 1

        cap.release()

        print(f"{video_name} -> {saved} frames extracted")


print("===================================")
print("Extracting REAL videos...")
print("===================================")
extract_frames(REAL_PATH, OUTPUT_REAL)

print("\n===================================")
print("Extracting FAKE videos...")
print("===================================")
extract_frames(FAKE_PATH, OUTPUT_FAKE)

print("\nFrame extraction completed.")