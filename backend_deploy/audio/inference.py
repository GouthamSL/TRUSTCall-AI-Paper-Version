# audio/inference.py

import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import onnxruntime as ort
from scipy.signal import resample_poly


MODEL_PATH = Path("audio/models/aasist_l/aasist-l.onnx")

TARGET_SAMPLE_RATE = 16000
MODEL_INPUT_LENGTH = 64600


class AASISTInference:
    """
    CPU inference wrapper for the AASIST-L anti-spoofing model.

    Class mapping:
        0 -> spoof
        1 -> bona fide
    """

    def __init__(self, model_path=MODEL_PATH):

        self.model_path = Path(model_path)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"AASIST-L model not found: {self.model_path}"
            )

        self.session = ort.InferenceSession(
            str(self.model_path),
            providers=["CPUExecutionProvider"]
        )

        self.input_name = self.session.get_inputs()[0].name

    def prepare_audio(self, audio):

        audio = np.asarray(
            audio,
            dtype=np.float32
        ).reshape(-1)

        if len(audio) == 0:
            raise ValueError("Audio input is empty.")

        if len(audio) >= MODEL_INPUT_LENGTH:

            audio = audio[:MODEL_INPUT_LENGTH]

        else:

            repeats = int(
                np.ceil(
                    MODEL_INPUT_LENGTH / len(audio)
                )
            )

            audio = np.tile(
                audio,
                repeats
            )

            audio = audio[:MODEL_INPUT_LENGTH]

        return audio.astype(np.float32)

    def predict(self, audio):

        audio = self.prepare_audio(audio)

        model_input = np.expand_dims(
            audio,
            axis=0
        )

        outputs = self.session.run(
            None,
            {
                self.input_name: model_input
            }
        )

        logits = outputs[0][0]

        probabilities = self._softmax(logits)

        spoof_probability = float(
            probabilities[0]
        )

        bonafide_probability = float(
            probabilities[1]
        )

        if bonafide_probability >= spoof_probability:
            status = "likely_real"
        else:
            status = "suspicious"

        return {
            "audio_status": status,
            "spoof_probability": round(
                spoof_probability,
                4
            ),
            "bonafide_probability": round(
                bonafide_probability,
                4
            )
        }

    @staticmethod
    def _softmax(logits):

        logits = logits - np.max(logits)

        exp_values = np.exp(logits)

        return exp_values / np.sum(exp_values)

    @staticmethod
    def load_audio(audio_path):

        audio, sample_rate = sf.read(
            audio_path,
            dtype="float32"
        )

        if audio.ndim > 1:

            audio = np.mean(
                audio,
                axis=1
            )

        if sample_rate != TARGET_SAMPLE_RATE:

            audio = resample_poly(
                audio,
                TARGET_SAMPLE_RATE,
                sample_rate
            ).astype(np.float32)

        max_value = np.max(
            np.abs(audio)
        )

        if max_value > 0:

            audio = audio / max_value

        return audio.astype(np.float32), TARGET_SAMPLE_RATE

    def predict_audio(
        self,
        audio,
        sample_rate=TARGET_SAMPLE_RATE
    ):

        audio = np.asarray(
            audio,
            dtype=np.float32
        ).reshape(-1)

        if len(audio) == 0:
            raise ValueError("Audio input is empty.")

        if sample_rate != TARGET_SAMPLE_RATE:

            audio = resample_poly(
                audio,
                TARGET_SAMPLE_RATE,
                sample_rate
            ).astype(np.float32)

        audio = audio - np.mean(audio)

        max_value = np.max(
            np.abs(audio)
        )

        if max_value > 0:

            audio = audio / max_value

        return self.predict(audio)


def run_inference(audio_path):

    audio_path = Path(audio_path)

    if not audio_path.exists():

        print(
            f"ERROR: Audio file not found: {audio_path}"
        )

        return

    print("Loading AASIST-L ONNX model...")

    detector = AASISTInference()

    print("Model loaded successfully.")

    print(
        f"\nLoading audio: {audio_path}"
    )

    audio, sample_rate = detector.load_audio(
        audio_path
    )

    print(
        f"Processed audio samples: {len(audio)}"
    )

    result = detector.predict_audio(
        audio,
        sample_rate
    )

    print("\n========== RESULT ==========")

    print(
        f"Spoof probability:    "
        f"{result['spoof_probability']:.4f}"
    )

    print(
        f"Bonafide probability: "
        f"{result['bonafide_probability']:.4f}"
    )

    if result["audio_status"] == "likely_real":

        print(
            "\nPrediction: "
            "LIKELY REAL HUMAN VOICE"
        )

    else:

        print(
            "\nPrediction: "
            "SUSPICIOUS / AI-GENERATED VOICE"
        )

    print("============================")


if __name__ == "__main__":

    if len(sys.argv) != 2:

        print("Usage:")
        print(
            "python audio/inference.py path/to/audio.wav"
        )

        sys.exit(1)

    run_inference(
        sys.argv[1]
    )
