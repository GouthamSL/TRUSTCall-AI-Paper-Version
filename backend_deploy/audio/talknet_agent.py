import contextlib
import io

from detectors.face_detector import FaceDetector
from audio.talknet_tracker import FaceTrackSelector
from audio.talknet_sync import TalkNetSync


class TalkNetAgent:

    def __init__(self):

        self.face_detector = FaceDetector()
        self.face_tracker = FaceTrackSelector()
        self.talknet = TalkNetSync()

    def process_video_audio(
        self,
        audio,
        frames,
        sample_rate=16000
    ):

        if not frames:

            return {
                "agent": "audio",
                "av_status": "insufficient_data",
                "av_consistency_score": None,
                "confidence": None,
                "frames_used": 0
            }

        face_crops = []

        for frame in frames:

            # Suppress MediaPipe diagnostic output
            with contextlib.redirect_stdout(io.StringIO()):

                detection_result = self.face_detector.detect(frame)

            detections = detection_result.get(
                "detections",
                []
            )

            selected = self.face_tracker.select_face(
                detections,
                frame
            )

            if selected is not None:

                face_crops.append(
                    selected["crop"]
                )

        if len(face_crops) < 25:

            return {
                "agent": "audio",
                "av_status": "insufficient_data",
                "av_consistency_score": None,
                "confidence": None,
                "frames_used": len(face_crops)
            }

        result = self.talknet.predict(
            audio,
            face_crops,
            sample_rate=sample_rate
        )

        return {
            "agent": "audio",
            "av_status": result["av_status"],
            "av_consistency_score": result["av_score"],
            "confidence": result["confidence"],
            "frames_used": result["frames_used"],
            "duration_seconds": result.get(
                "duration_seconds"
            )
        }

    def reset(self):

        self.face_tracker.reset()