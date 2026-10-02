from datetime import datetime

import numpy as np

from audio.preprocessing import preprocess_audio
from audio.vad import VoiceActivityDetector
from audio.buffer import AudioBuffer
from audio.smoothing import TemporalSmoother
from audio.inference import AASISTInference
from audio.talknet_agent import TalkNetAgent
from audio.audio_fusion import AudioFusion


class AudioAgent:

    def __init__(self):

        # ====================================================
        # AASIST-L
        # ====================================================

        self.vad = VoiceActivityDetector(
            threshold=0.01
        )

        self.buffer = AudioBuffer(
            sample_rate=16000,
            window_samples=64600,
            hop_samples=32000
        )

        self.smoother = TemporalSmoother(
            history_size=5,
            threshold=0.5
        )

        self.inference = AASISTInference()

        # ====================================================
        # TALKNET
        # ====================================================

        self.talknet_agent = TalkNetAgent()

        # ====================================================
        # AUDIO FUSION
        # ====================================================

        self.fusion = AudioFusion(
            voice_weight=0.60,
            av_weight=0.40
        )

    # ========================================================
    # AUDIO-ONLY PIPELINE
    # ========================================================

    def process_audio(
        self,
        audio,
        sample_rate=16000
    ):

        audio = np.asarray(
            audio,
            dtype=np.float32
        ).reshape(-1)

        if len(audio) == 0:
            return []

        audio, sample_rate = preprocess_audio(
            audio,
            sample_rate
        )

        windows = self.buffer.add(audio)

        results = []

        for window in windows:

            vad_result = self.vad.analyze(window)

            if not vad_result["speech_detected"]:

                results.append({
                    "agent": "audio",
                    "audio_status": "no_speech",
                    "speech_detected": False,
                    "rms_energy": vad_result["rms_energy"],
                    "timestamp": datetime.now().isoformat(),
                    "window_duration_seconds": round(
                        len(window) / 16000,
                        4
                    )
                })

                continue

            inference_result = self.inference.predict_audio(
                window,
                sample_rate=16000
            )

            smooth_result = self.smoother.add(
                inference_result["spoof_probability"]
            )

            results.append({

                "agent": "audio",

                "audio_status":
                    smooth_result["audio_status"],

                "speech_detected": True,

                "spoof_probability":
                    smooth_result["spoof_probability"],

                "bonafide_probability":
                    smooth_result["bonafide_probability"],

                "confidence":
                    smooth_result["confidence"],

                "audio_trust_score":
                    smooth_result["audio_trust_score"],

                "windows_used":
                    smooth_result["windows_used"],

                "rms_energy":
                    vad_result["rms_energy"],

                "timestamp":
                    datetime.now().isoformat(),

                "window_duration_seconds":
                    round(
                        len(window) / 16000,
                        4
                    )
            })

        return results

    # ========================================================
    # MULTIMODAL AUDIO PIPELINE
    # ========================================================

    def process_multimodal(
        self,
        audio,
        frames,
        sample_rate=16000
    ):

        # ====================================================
        # INPUT VALIDATION
        # ====================================================

        if audio is None:

            return {
                "agent": "audio",
                "audio_status": "insufficient_data",
                "speech_detected": False,
                "timestamp": datetime.now().isoformat()
            }

        if frames is None:
            frames = []

        # ====================================================
        # ORIGINAL AUDIO
        #
        # Keep original amplitude for TalkNet.
        # ====================================================

        original_audio = np.asarray(
            audio,
            dtype=np.float32
        )

        if original_audio.ndim > 1:

            original_audio = np.mean(
                original_audio,
                axis=1
            )

        original_audio = (
            original_audio
            .reshape(-1)
        )

        if len(original_audio) == 0:

            return {
                "agent": "audio",
                "audio_status": "insufficient_data",
                "speech_detected": False,
                "timestamp": datetime.now().isoformat()
            }

        # ====================================================
        # VAD
        # ====================================================

        vad_result = self.vad.analyze(
            original_audio
        )

        if not vad_result["speech_detected"]:

            return {

                "agent": "audio",

                "audio_status": "no_speech",

                "speech_detected": False,

                "rms_energy":
                    vad_result["rms_energy"],

                "timestamp":
                    datetime.now().isoformat()
            }

        # ====================================================
        # AASIST-L
        #
        # Preprocess a COPY of the audio.
        # TalkNet continues to use original_audio.
        # ====================================================

        aasist_audio, aasist_rate = preprocess_audio(
            original_audio.copy(),
            sample_rate
        )

        # ====================================================
        # AASIST WINDOW SETTINGS
        # ====================================================

        window_size = 64600
        hop_size = 32000

        spoof_scores = []

        # ====================================================
        # CASE 1:
        # Audio is long enough for complete windows.
        # ====================================================

        if len(aasist_audio) >= window_size:

            for start in range(
                0,
                len(aasist_audio) - window_size + 1,
                hop_size
            ):

                window = aasist_audio[
                    start:start + window_size
                ]

                result = self.inference.predict_audio(
                    window,
                    sample_rate=aasist_rate
                )

                spoof_scores.append(
                    result["spoof_probability"]
                )

        # ====================================================
        # CASE 2:
        # Audio is shorter than 64600 samples.
        #
        # AASISTInference.prepare_audio() handles shorter
        # audio by repeating it to the required length.
        # ====================================================

        elif len(aasist_audio) > 0:

            result = self.inference.predict_audio(
                aasist_audio,
                sample_rate=aasist_rate
            )

            spoof_scores.append(
                result["spoof_probability"]
            )

        # ====================================================
        # SAFETY CHECK
        # ====================================================

        if len(spoof_scores) == 0:

            return {

                "agent": "audio",

                "audio_status":
                    "insufficient_data",

                "speech_detected": True,

                "rms_energy":
                    vad_result["rms_energy"],

                "timestamp":
                    datetime.now().isoformat()
            }

        # ====================================================
        # TEMPORAL SMOOTHING
        # ====================================================

        smooth_result = None

        for spoof_score in spoof_scores:

            smooth_result = self.smoother.add(
                spoof_score
            )

        # ====================================================
        # VOICE AUTHENTICITY RESULT
        # ====================================================

        voice_result = {

            "audio_status":
                smooth_result["audio_status"],

            "spoof_probability":
                smooth_result["spoof_probability"],

            "bonafide_probability":
                smooth_result["bonafide_probability"],

            "confidence":
                smooth_result["confidence"]
        }

        # ====================================================
        # TALKNET
        #
        # IMPORTANT:
        # Use ORIGINAL audio here.
        #
        # Do NOT use normalized AASIST audio.
        # ====================================================

        av_result = self.talknet_agent.process_video_audio(

            audio=original_audio,

            frames=frames,

            sample_rate=sample_rate
        )

        # ====================================================
        # AUDIO FUSION
        # ====================================================

        fusion_result = self.fusion.fuse(

            voice_result,

            av_result
        )

        # ====================================================
        # CONFIDENCE
        #
        # AudioFusion currently does not necessarily return
        # a separate "confidence" field.
        #
        # Derive confidence from the strongest available
        # signal.
        # ====================================================

        confidence = max(

            float(
                fusion_result.get(
                    "voice_bonafide_probability",
                    0.5
                )
            ),

            float(
                fusion_result.get(
                    "voice_spoof_probability",
                    0.5
                )
            ),

            float(
                fusion_result.get(
                    "av_consistency_score",
                    0.5
                )
            )
        )

        confidence = round(
            confidence,
            4
        )

        # ====================================================
        # FINAL AUDIO AGENT RESULT
        # ====================================================

        return {

            "agent": "audio",

            "audio_status":
                fusion_result.get(
                    "audio_status",
                    "uncertain"
                ),

            "speech_detected": True,

            # ------------------------------------------------
            # Voice Authenticity
            # ------------------------------------------------

            "voice_status":
                fusion_result.get(
                    "voice_status"
                ),

            "voice_spoof_probability":
                fusion_result.get(
                    "voice_spoof_probability"
                ),

            "voice_bonafide_probability":
                fusion_result.get(
                    "voice_bonafide_probability"
                ),

            # ------------------------------------------------
            # Audio-Visual Consistency
            # ------------------------------------------------

            "av_status":
                fusion_result.get(
                    "av_status"
                ),

            "av_consistency_score":
                fusion_result.get(
                    "av_consistency_score"
                ),

            # ------------------------------------------------
            # Final Audio Trust
            # ------------------------------------------------

            "audio_trust_score":
                fusion_result.get(
                    "audio_trust_score"
                ),

            "fusion_weights":
                fusion_result.get(
                    "fusion_weights",
                    {
                        "voice_authenticity": 0.60,
                        "av_consistency": 0.40
                    }
                ),

            "confidence":
                confidence,

            # ------------------------------------------------
            # Processing Information
            # ------------------------------------------------

            "frames_used":
                av_result.get(
                    "frames_used"
                ),

            "aasist_windows_used":
                len(spoof_scores),

            "rms_energy":
                vad_result[
                    "rms_energy"
                ],

            "timestamp":
                datetime.now().isoformat(),

            "window_duration_seconds":
                round(
                    window_size / 16000,
                    4
                )
        }

    # ========================================================
    # RESET
    # ========================================================

    def reset(self):

        self.buffer.reset()

        self.smoother.reset()

        self.talknet_agent.reset()