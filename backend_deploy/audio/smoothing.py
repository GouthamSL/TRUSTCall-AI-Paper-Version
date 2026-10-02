# audio/smoothing.py

from collections import deque


class TemporalSmoother:
    """
    Smooth audio spoof probabilities across multiple
    consecutive windows.
    """

    def __init__(self, history_size=5, threshold=0.5):

        self.history_size = history_size
        self.threshold = threshold

        self.history = deque(
            maxlen=history_size
        )

    def add(self, spoof_probability):
        """
        Add a new spoof probability and return
        the smoothed result.
        """

        spoof_probability = float(
            max(0.0, min(1.0, spoof_probability))
        )

        self.history.append(
            spoof_probability
        )

        average_spoof = (
            sum(self.history)
            / len(self.history)
        )

        average_bonafide = (
            1.0 - average_spoof
        )

        if average_spoof > self.threshold:
            status = "suspicious"
        else:
            status = "likely_real"

        confidence = max(
            average_spoof,
            average_bonafide
        )

        trust_score = round(
            average_bonafide * 100,
            2
        )

        return {
            "audio_status": status,
            "spoof_probability": round(
                average_spoof, 4
            ),
            "bonafide_probability": round(
                average_bonafide, 4
            ),
            "confidence": round(
                confidence, 4
            ),
            "audio_trust_score": trust_score,
            "windows_used": len(self.history)
        }

    def reset(self):
        """Clear prediction history."""

        self.history.clear()

    def get_history(self):
        """Return current prediction history."""

        return list(self.history)