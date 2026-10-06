from datetime import datetime


class ConsensusAgent:
    """
    Vision-only consensus layer for TRUSTCall AI.

    The Consensus Agent receives the Vision Agent result
    and converts it into the final trust/liveness decision.

    No additional ML model is used here.
    """

    def __init__(self):
        pass

    # ========================================================
    # MAIN CONSENSUS FUNCTION
    # ========================================================

    def analyze(self, vision_result=None):

        if vision_result is None:
            vision_result = {}

        # ====================================================
        # VISION SIGNAL
        # ====================================================

        vision_score = self._get_vision_trust(
            vision_result
        )

        # ====================================================
        # NO VISION DATA
        # ====================================================

        if vision_score is None:

            return {
                "agent": "consensus",

                "status": "insufficient_data",

                "final_trust_score": None,

                "vision_score": None,

                "active_signals": [],

                "timestamp":
                    datetime.now().isoformat()
            }

        # ====================================================
        # FINAL TRUST SCORE
        # ====================================================

        final_trust_score = round(
            float(vision_score),
            2
        )

        # ====================================================
        # FINAL STATUS
        # ====================================================

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
                round(float(vision_score), 2),

            "active_signals": [
                "vision"
            ],

            "weights": {
                "vision": 1.0
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

        # ----------------------------------------------------
        # Preferred Vision Agent field
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Alternative naming
        # ----------------------------------------------------

        if "trust_score" in vision_result:

            value = vision_result.get(
                "trust_score"
            )

            if value is not None:

                value = float(value)

                if 0.0 <= value <= 1.0:

                    return value * 100.0

                return value

        # ----------------------------------------------------
        # Real probability
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Deepfake probability
        # ----------------------------------------------------

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