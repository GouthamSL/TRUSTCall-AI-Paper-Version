export async function getAvailableCameras() {
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    const devices = await navigator.mediaDevices.enumerateDevices();

    tempStream.getTracks().forEach((track) => track.stop());

    return devices.filter(
      (device) => device.kind === "videoinput"
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function startCamera(deviceId) {
  return await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: deviceId
        ? { exact: deviceId }
        : undefined,
    },

    audio: true,
  });
}