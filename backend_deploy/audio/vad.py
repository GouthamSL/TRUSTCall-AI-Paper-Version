# audio/vad.py

import numpy as np


class VoiceActivityDetector:
    """
    Lightweight CPU-based Voice Activity Detector.

    This first version uses RMS energy.
    It is intentionally simple and fast for the CPU-only
    TRUSTCall Audio Agent.
    """

    def __init__(self, threshold=0.01):

        self.threshold = threshold

    def calculate_rms(self, audio):
        """
        Calculate Root Mean Square energy.
        """

        audio = np.asarray(audio, dtype=np.float32)

        if len(audio) == 0:
            return 0.0

        rms = np.sqrt(
            np.mean(np.square(audio))
        )

        return float(rms)

    def is_speech(self, audio):
        """
        Return True if the audio contains enough
        acoustic energy to be considered speech.
        """

        rms = self.calculate_rms(audio)

        return rms >= self.threshold

    def analyze(self, audio):
        """
        Return VAD information.
        """

        rms = self.calculate_rms(audio)

        speech_detected = rms >= self.threshold

        return {
            "speech_detected": speech_detected,
            "rms_energy": round(rms, 6)
        }