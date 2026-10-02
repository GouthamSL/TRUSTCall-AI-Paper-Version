from datetime import datetime


class ConsensusAgent:
    """
    Combines Vision Agent and Audio Agent outputs
    into a single TRUSTCall decision.

    This is a lightweight rule-based consensus layer.
    No additional ML model is used here.
    """

    def __init__(
        self,
        vision_weight=0.60,
        audio_weight=0.40
    ):
        self.vision_weight = vision_weight
        self.audio_weight = audio_weight

    # ========================================================
    # MAIN CONSENSUS FUNCTION
    # ========================================================

    def analyze(
        self,
        vision_result=None,
        audio_result=None
    ):
        if vision_result is None:
            vision_result = {}

        if audio_result is None:
            audio_result = {}

        # ====================================================
        # VISION SIGNAL
        # ====================================================

        vision_score = self._get_vision_trust(
            vision_result
        )

        # ====================================================
        # AUDIO SIGNAL
        # ====================================================

        audio_score = self._get_audio_trust(
            audio_result
        )

        # ====================================================
        # AVAILABLE SIGNALS
        # ====================================================

        vision_available = (
            vision_score is not None
        )

        audio_available = (
            audio_score is not None
        )

        # ====================================================
        # BOTH AVAILABLE
        # ====================================================

        if vision_available and audio_available:

            final_trust_score = (
                self.vision_weight * vision_score
                +
                self.audio_weight * audio_score
            )

            active_signals = [
                "vision",
                "audio"
            ]

        # ====================================================
        # ONLY VISION AVAILABLE
        # ====================================================

        elif vision_available:

            final_trust_score = vision_score

            active_signals = [
                "vision"
            ]

        # ====================================================
        # ONLY AUDIO AVAILABLE
        # ====================================================

        elif audio_available:

            final_trust_score = audio_score

            active_signals = [
                "audio"
            ]

        # ====================================================
        # NOTHING AVAILABLE
        # ====================================================

        else:

            return {
                "agent": "consensus",

                "status": "insufficient_data",

                "final_trust_score": None,

                "vision_score": None,

                "audio_score": None,

                "active_signals": [],

                "timestamp":
                    datetime.now().isoformat()
            }

        # ====================================================
        # FINAL STATUS
        # ====================================================

        final_trust_score = round(
            float(final_trust_score),
            2
        )

        if final_trust_score >= 70:

            status = "likely_real"

        elif final_trust_score >= 40:

            status = "uncertain"

        else:

            status = "suspicious"

        # ====================================================
        # RETURN
        # ====================================================

        return {
            "agent": "consensus",

            "status": status,

            "final_trust_score":
                final_trust_score,

            "vision_score":
                None if vision_score is None
                else round(float(vision_score), 2),

            "audio_score":
                None if audio_score is None
                else round(float(audio_score), 2),

            "active_signals":
                active_signals,

            "weights": {
                "vision": self.vision_weight,
                "audio": self.audio_weight
            },

            "timestamp":
                datetime.now().isoformat()
        }

    # ========================================================
    # VISION TRUST EXTRACTION
    # ========================================================

    def _get_vision_trust(
        self,
        vision_result
    ):
        if not vision_result:
            return None

        # Preferred existing Vision Agent field
        if "vision_score" in vision_result:

            value = vision_result.get(
                "vision_score"
            )

            if value is not None:

                value = float(value)

                # Vision model may return a probability
                # in the range 0-1.
                # Consensus uses a trust-score range 0-100.
                if 0.0 <= value <= 1.0:
                    return value * 100.0

                # Already in 0-100 format
                return value

        # Alternative naming
        if "trust_score" in vision_result:

            value = vision_result.get(
                "trust_score"
            )

            if value is not None:

                value = float(value)

                if 0.0 <= value <= 1.0:
                    return value * 100.0

                return value

        # If probabilities are available
        real_probability = (
            vision_result.get(
                "real_probability"
            )
        )

        if real_probability is not None:

            return (
                float(real_probability)
                * 100.0
            )

        # Deepfake probability can be inverted
        deepfake_probability = (
            vision_result.get(
                "deepfake_probability"
            )
        )

        if deepfake_probability is not None:

            return (
                1.0
                - float(deepfake_probability)
            ) * 100.0

        return None

    # ========================================================
    # AUDIO TRUST EXTRACTION
    # ========================================================

    def _get_audio_trust(
        self,
        audio_result
    ):
        if not audio_result:
            return None

        value = audio_result.get(
            "audio_trust_score"
        )

        if value is not None:

            value = float(value)

            # Handle normalized audio score if necessary
            if 0.0 <= value <= 1.0:
                return value * 100.0

            return value

        # Fallback using voice authenticity
        bonafide_probability = (
            audio_result.get(
                "voice_bonafide_probability"
            )
        )

        av_consistency = (
            audio_result.get(
                "av_consistency_score"
            )
        )

        # Both available
        if (
            bonafide_probability is not None
            and av_consistency is not None
        ):

            return (
                0.60
                * float(bonafide_probability)
                +
                0.40
                * float(av_consistency)
            ) * 100.0

        # Voice only
        if bonafide_probability is not None:

            return (
                float(bonafide_probability)
                * 100.0
            )

        # AV only
        if av_consistency is not None:

            return (
                float(av_consistency)
                * 100.0
            )

        return None