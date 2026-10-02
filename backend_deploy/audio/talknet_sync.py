# audio/talknet_sync.py

from pathlib import Path
import sys

import cv2
import numpy as np
import torch
import torch.nn.functional as F
import python_speech_features


# ---------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------

TALKNET_ROOT = Path("audio/models/talknet/TalkNet-src")
CHECKPOINT_PATH = Path("audio/models/talknet/pretrain_TalkSet.model")

TARGET_SAMPLE_RATE = 16000
VIDEO_FPS = 25

MFCC_DIM = 13
VISUAL_SIZE = 112


class TalkNetSync:
    """
    CPU-only TalkNet wrapper for TRUSTCall AI.

    Purpose:
        Estimate audio-visual speaking consistency.

    Input:
        - Audio waveform
        - Sequence of face crops

    Output:
        - AV speaking-consistency score
        - Classification between the two TalkNet classes

    Important:
        TalkNet is an active-speaker/audio-visual consistency model.
        Its output should NOT be interpreted as a direct deepfake
        probability.
    """

    def __init__(
        self,
        checkpoint_path=CHECKPOINT_PATH,
    ):
        self.device = torch.device("cpu")

        checkpoint_path = Path(checkpoint_path)

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"TalkNet checkpoint not found: {checkpoint_path}"
            )

        # Allow TalkNet source imports without modifying the original code.
        talknet_root = Path(TALKNET_ROOT).resolve()

        if str(talknet_root) not in sys.path:
            sys.path.insert(0, str(talknet_root))

        from model.talkNetModel import talkNetModel
        from loss import lossAV

        self.model = talkNetModel().to(self.device)
        self.loss_av = lossAV().to(self.device)

        print("Loading TalkNet checkpoint on CPU...")

        checkpoint = torch.load(
            checkpoint_path,
            map_location=self.device,
            weights_only=False
        )

        self.model.load_state_dict(
            self._extract_model_state(checkpoint),
            strict=True
        )

        self.loss_av.load_state_dict(
            self._extract_loss_state(checkpoint),
            strict=True
        )

        self.model.eval()
        self.loss_av.eval()

        print("TalkNet loaded successfully on CPU.")

    # -----------------------------------------------------------------
    # Checkpoint handling
    # -----------------------------------------------------------------

    @staticmethod
    def _extract_model_state(checkpoint):
        """
        Extract the TalkNet model state dictionary from the checkpoint.
        """

        if isinstance(checkpoint, dict):

            # Standard checkpoint structure
            if "model" in checkpoint:
                return checkpoint["model"]

            # Some TalkNet checkpoints contain keys such as:
            # model.visualFrontend...
            model_keys = {
                k: v
                for k, v in checkpoint.items()
                if k.startswith("model.")
            }

            if model_keys:
                return {
                    k[len("model."):]: v
                    for k, v in model_keys.items()
                }

            # Already a raw state_dict
            if any(
                k.startswith("visualFrontend.")
                or k.startswith("audioEncoder.")
                for k in checkpoint.keys()
            ):
                return checkpoint

        raise RuntimeError(
            "Unable to determine TalkNet model state dictionary."
        )

    @staticmethod
    def _extract_loss_state(checkpoint):
        """
        Extract the 256 -> 2 classification layer from the checkpoint.
        """

        if isinstance(checkpoint, dict):

            if "lossAV" in checkpoint:
                return checkpoint["lossAV"]

            loss_keys = {
                k: v
                for k, v in checkpoint.items()
                if k.startswith("lossAV.")
            }

            if loss_keys:
                return {
                    k[len("lossAV."):]: v
                    for k, v in loss_keys.items()
                }

        raise RuntimeError(
            "Unable to determine TalkNet lossAV state dictionary."
        )

    # -----------------------------------------------------------------
    # Audio preprocessing
    # -----------------------------------------------------------------

    @staticmethod
    def prepare_audio(audio, sample_rate):
        """
        Convert incoming audio into mono 16 kHz float32.
        """

        audio = np.asarray(audio, dtype=np.float32)

        if audio.ndim > 1:
            audio = np.mean(audio, axis=1)

        audio = audio.reshape(-1)

        if len(audio) == 0:
            raise ValueError("Audio input is empty.")

        if sample_rate != TARGET_SAMPLE_RATE:

            from scipy.signal import resample_poly

            audio = resample_poly(
                audio,
                TARGET_SAMPLE_RATE,
                sample_rate
            ).astype(np.float32)

        return audio.astype(np.float32)

    @staticmethod
    def extract_mfcc(audio):
        """
        Extract TalkNet-compatible MFCC features.

        TalkNet's original configuration at 25 FPS:
            sample rate = 16000
            numcep = 13
            winlen = 0.025
            winstep = 0.010
        """

        mfcc = python_speech_features.mfcc(
            audio,
            TARGET_SAMPLE_RATE,
            numcep=MFCC_DIM,
            winlen=0.025,
            winstep=0.010
        )

        return mfcc.astype(np.float32)

    # -----------------------------------------------------------------
    # Visual preprocessing
    # -----------------------------------------------------------------

    @staticmethod
    def prepare_face_crop(face_crop):
        """
        Convert TRUSTCall's existing 224x224 BGR face crop
        into TalkNet's expected 112x112 grayscale format.
        """

        if face_crop is None:
            raise ValueError("Face crop is None.")

        face_crop = np.asarray(face_crop)

        if face_crop.size == 0:
            raise ValueError("Face crop is empty.")

        # Existing Vision Agent returns BGR.
        if face_crop.ndim == 3:
            face_crop = cv2.cvtColor(
                face_crop,
                cv2.COLOR_BGR2GRAY
            )

        face_crop = cv2.resize(
            face_crop,
            (VISUAL_SIZE, VISUAL_SIZE)
        )

        return face_crop.astype(np.float32)

    @classmethod
    def prepare_visual_sequence(cls, face_crops):
        """
        Convert a sequence of TRUSTCall face crops into:

            T x 112 x 112
        """

        if not face_crops:
            raise ValueError("No face crops supplied.")

        frames = []

        for crop in face_crops:
            frames.append(
                cls.prepare_face_crop(crop)
            )

        return np.stack(frames, axis=0).astype(np.float32)

    # -----------------------------------------------------------------
    # Temporal alignment
    # -----------------------------------------------------------------

    @staticmethod
    def align_features(audio_mfcc, visual_frames):
        """
        Align MFCC and visual features using TalkNet's 4:1
        audio-to-video temporal relationship.

        At 25 FPS:
            25 visual frames/sec
            100 MFCC frames/sec
        """

        num_visual_frames = visual_frames.shape[0]

        max_audio_frames = num_visual_frames * 4

        if audio_mfcc.shape[0] < max_audio_frames:

            shortage = max_audio_frames - audio_mfcc.shape[0]

            audio_mfcc = np.pad(
                audio_mfcc,
                ((0, shortage), (0, 0)),
                mode="wrap"
            )

        audio_mfcc = audio_mfcc[:max_audio_frames]

        return audio_mfcc, visual_frames

    # -----------------------------------------------------------------
    # Inference
    # -----------------------------------------------------------------

    @torch.no_grad()
    def predict(self, audio, face_crops, sample_rate=16000):
        """
        Run CPU TalkNet inference.

        Returns:
            Dictionary containing AV consistency information.
        """

        audio = self.prepare_audio(
            audio,
            sample_rate
        )

        audio_mfcc = self.extract_mfcc(audio)

        visual_frames = self.prepare_visual_sequence(
            face_crops
        )

        audio_mfcc, visual_frames = self.align_features(
            audio_mfcc,
            visual_frames
        )

        # TalkNet requires equal temporal alignment.
        num_video_frames = visual_frames.shape[0]

        if num_video_frames < 25:
            return {
                "av_status": "insufficient_data",
                "av_score": None,
                "confidence": None,
                "frames_used": num_video_frames
            }

        # Limit to complete aligned chunks.
        usable_frames = min(
            visual_frames.shape[0],
            audio_mfcc.shape[0] // 4
        )

        usable_frames = (usable_frames // 25) * 25

        if usable_frames < 25:
            return {
                "av_status": "insufficient_data",
                "av_score": None,
                "confidence": None,
                "frames_used": usable_frames
            }

        visual_frames = visual_frames[:usable_frames]
        audio_mfcc = audio_mfcc[:usable_frames * 4]

        input_v = torch.from_numpy(
            visual_frames
        ).unsqueeze(0).to(self.device)

        input_a = torch.from_numpy(
            audio_mfcc
        ).unsqueeze(0).to(self.device)

        # TalkNet frontends
        embed_a = self.model.forward_audio_frontend(
            input_a
        )

        embed_v = self.model.forward_visual_frontend(
            input_v
        )

        # Audio-visual cross attention
        embed_a, embed_v = self.model.forward_cross_attention(
            embed_a,
            embed_v
        )

        # Audio-visual backend
        output = self.model.forward_audio_visual_backend(
            embed_a,
            embed_v
        )

        # TalkNet classification layer
        logits = self.loss_av.FC(
            output
        )

        probabilities = F.softmax(
            logits,
            dim=-1
        )

        # TalkNet class-1 score
        class_1_probability = probabilities[:, 1]

        av_score = float(
            class_1_probability.mean().cpu().item()
        )

        confidence = float(
            probabilities.max(dim=1).values.mean().cpu().item()
        )

        # The pretrained TalkNet checkpoint is trained for
        # active-speaker detection. Therefore we expose this
        # as AV consistency rather than deepfake probability.
        if av_score >= 0.5:
            status = "av_consistent"
        else:
            status = "av_inconsistent"

        return {
            "av_status": status,
            "av_score": round(av_score, 4),
            "confidence": round(confidence, 4),
            "frames_used": int(usable_frames),
            "duration_seconds": round(
                usable_frames / VIDEO_FPS,
                3
            )
        }
    