import cv2
import numpy as np


class FaceTrackSelector:

    def __init__(self, iou_threshold=0.20):
        self.iou_threshold = iou_threshold
        self.previous_box = None

    @staticmethod
    def calculate_iou(box_a, box_b):
        ax1, ay1, ax2, ay2 = box_a
        bx1, by1, bx2, by2 = box_b

        ix1 = max(ax1, bx1)
        iy1 = max(ay1, by1)
        ix2 = min(ax2, bx2)
        iy2 = min(ay2, by2)

        iw = max(0, ix2 - ix1)
        ih = max(0, iy2 - iy1)

        intersection = iw * ih

        area_a = max(0, ax2 - ax1) * max(0, ay2 - ay1)
        area_b = max(0, bx2 - bx1) * max(0, by2 - by1)

        union = area_a + area_b - intersection

        if union <= 0:
            return 0.0

        return intersection / union

    @staticmethod
    def get_box(detection, width, height):
        bbox = detection.location_data.relative_bounding_box

        x1 = max(0, int(bbox.xmin * width))
        y1 = max(0, int(bbox.ymin * height))

        x2 = min(
            width,
            x1 + int(bbox.width * width)
        )

        y2 = min(
            height,
            y1 + int(bbox.height * height)
        )

        return x1, y1, x2, y2

    @staticmethod
    def crop_face(frame, box):

        x1, y1, x2, y2 = box

        crop = frame[y1:y2, x1:x2]

        if crop.size == 0:
            return None

        return cv2.resize(crop, (112, 112))

    @staticmethod
    def largest_face(candidates):

        return max(
            candidates,
            key=lambda c:
            (c["box"][2] - c["box"][0]) *
            (c["box"][3] - c["box"][1])
        )

    def select_face(self, detections, frame):

        if not detections:
            return None

        height, width = frame.shape[:2]

        candidates = []

        for detection in detections:

            box = self.get_box(
                detection,
                width,
                height
            )

            x1, y1, x2, y2 = box

            if x2 <= x1 or y2 <= y1:
                continue

            confidence = float(detection.score[0])

            candidates.append({
                "box": box,
                "confidence": confidence
            })

        if not candidates:
            return None

        # First frame:
        # choose largest face.
        if self.previous_box is None:

            selected = self.largest_face(candidates)

        else:

            scored = []

            for candidate in candidates:

                overlap = self.calculate_iou(
                    self.previous_box,
                    candidate["box"]
                )

                scored.append(
                    (overlap, candidate)
                )

            best_iou, best_candidate = max(
                scored,
                key=lambda x: x[0]
            )

            if best_iou >= self.iou_threshold:

                selected = best_candidate

            else:

                selected = self.largest_face(candidates)

        self.previous_box = selected["box"]

        crop = self.crop_face(
            frame,
            selected["box"]
        )

        if crop is None:
            return None

        return {
            "crop": crop,
            "box": selected["box"],
            "confidence": selected["confidence"]
        }

    def reset(self):
        self.previous_box = None