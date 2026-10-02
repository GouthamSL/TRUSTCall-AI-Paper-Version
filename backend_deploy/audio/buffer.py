# audio/buffer.py

import numpy as np


class AudioBuffer:
    """
    Fixed-duration audio buffer for the TRUSTCall Audio Agent.

    AASIST-L expects exactly 64,600 samples at 16 kHz.
    The buffer produces overlapping windows for continuous analysis.
    """

    def __init__(
        self,
        sample_rate=16000,
        window_samples=64600,
        hop_samples=32000
    ):
        self.sample_rate = sample_rate
        self.window_samples = window_samples
        self.hop_samples = hop_samples

        self.buffer = np.array([], dtype=np.float32)

    def add(self, audio):
        """
        Add audio samples and return all complete analysis windows.
        """

        audio = np.asarray(audio, dtype=np.float32).reshape(-1)

        if len(audio) == 0:
            return []

        self.buffer = np.concatenate([self.buffer, audio])

        windows = []

        while len(self.buffer) >= self.window_samples:

            window = self.buffer[:self.window_samples].copy()

            windows.append(window)

            # Keep overlap for the next analysis window.
            self.buffer = self.buffer[self.hop_samples:]

        return windows

    def reset(self):
        """Clear the internal audio buffer."""
        self.buffer = np.array([], dtype=np.float32)

    def pending_samples(self):
        """Return the number of samples waiting for the next window."""
        return len(self.buffer)