class AudioFusion:

    def __init__(
        self,
        voice_weight=0.60,
        av_weight=0.40
    ):
        self.voice_weight = voice_weight
        self.av_weight = av_weight

    def fuse(
        self,
        voice_result,
        av_result
    ):
        """
        Combine AASIST-L voice authenticity
        and TalkNet AV consistency.

        voice_result:
            AASIST-L output dictionary

        av_result:
            TalkNetAgent output dictionary
        """

        # ----------------------------------------------------
        # VOICE AUTHENTICITY
        # ----------------------------------------------------

        voice_spoof = voice_result.get(
            "spoof_probability"
        )

        voice_bonafide = voice_result.get(
            "bonafide_probability"
        )

        # If AASIST result is unavailable
        if voice_spoof is None:

            voice_spoof = 0.5

        if voice_bonafide is None:

            voice_bonafide = 1.0 - voice_spoof

        # ----------------------------------------------------
        # AV CONSISTENCY
        # ----------------------------------------------------

        av_score = av_result.get(
            "av_consistency_score"
        )

        # If TalkNet result is unavailable
        if av_score is None:

            av_score = 0.5

        # ----------------------------------------------------
        # AUDIO TRUST
        # ----------------------------------------------------

        # AASIST:
        # higher bonafide probability = more trustworthy

        voice_trust = voice_bonafide

        # TalkNet:
        # higher AV consistency = more trustworthy

        av_trust = av_score

        combined_trust = (
            self.voice_weight * voice_trust
            +
            self.av_weight * av_trust
        )

        combined_trust = max(
            0.0,
            min(1.0, combined_trust)
        )

        audio_trust_score = round(
            combined_trust * 100,
            2
        )

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        if audio_trust_score >= 70:

            audio_status = "likely_real"

        elif audio_trust_score >= 40:

            audio_status = "uncertain"

        else:

            audio_status = "suspicious"

        return {
            "agent": "audio",

            "audio_status": audio_status,

            "voice_status": voice_result.get(
                "audio_status",
                "unknown"
            ),

            "voice_spoof_probability": round(
                float(voice_spoof),
                4
            ),

            "voice_bonafide_probability": round(
                float(voice_bonafide),
                4
            ),

            "av_status": av_result.get(
                "av_status",
                "unknown"
            ),

            "av_consistency_score": round(
                float(av_score),
                4
            ),

            "audio_trust_score": audio_trust_score,

            "fusion_weights": {
                "voice_authenticity": self.voice_weight,
                "av_consistency": self.av_weight
            }
        }