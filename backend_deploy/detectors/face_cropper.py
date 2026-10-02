import cv2


class FaceCropper:

    def crop_face(self, frame, detection):

        h, w, _ = frame.shape

        bbox = detection.location_data.relative_bounding_box

        xmin = int(bbox.xmin * w)
        ymin = int(bbox.ymin * h)
        width = int(bbox.width * w)
        height = int(bbox.height * h)

        xmin = max(0, xmin)
        ymin = max(0, ymin)

        xmax = min(w, xmin + width)
        ymax = min(h, ymin + height)

        face_crop = frame[ymin:ymax, xmin:xmax]

        if face_crop.size == 0:
            return None

        face_crop = cv2.resize(face_crop, (224, 224))

        return face_crop