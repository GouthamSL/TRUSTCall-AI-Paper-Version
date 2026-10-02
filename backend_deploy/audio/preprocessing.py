# audio/preprocessing.py

import numpy as np
from scipy.signal import resample_poly


TARGET_SAMPLE_RATE = 16000


def convert_to_mono(audio):
    """
    Convert audio to mono.
    """

    audio = np.asarray(audio, dtype=np.float32)

    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    return audio.astype(np.float32)


def resample_audio(audio, sample_rate):
    """
    Resample audio to 16 kHz.
    """

    if sample_rate == TARGET_SAMPLE_RATE:
        return audio.astype(np.float32)

    audio = resample_poly(
        audio,
        TARGET_SAMPLE_RATE,
        sample_rate
    )

    return audio.astype(np.float32)


def normalize_audio(audio):
    """
    Normalize waveform amplitude to approximately -1 to +1.
    """

    audio = np.asarray(audio, dtype=np.float32)

    # Remove DC offset
    audio = audio - np.mean(audio)

    peak = np.max(np.abs(audio))

    if peak > 0:
        audio = audio / peak

    return audio.astype(np.float32)


def preprocess_audio(audio, sample_rate):
    """
    Complete preprocessing pipeline:

    1. Convert to mono
    2. Resample to 16 kHz
    3. Normalize amplitude

    Returns:
        processed_audio
        target_sample_rate
    """

    audio = convert_to_mono(audio)

    audio = resample_audio(
        audio,
        sample_rate
    )

    audio = normalize_audio(audio)

    return audio, TARGET_SAMPLE_RATE