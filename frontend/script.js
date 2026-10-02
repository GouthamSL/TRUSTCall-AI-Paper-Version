const video = document.getElementById("video");
const startCameraBtn = document.getElementById("startCamera");

startCameraBtn.addEventListener("click", startCamera);

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

        console.log("Camera Started Successfully");

    } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Unable to access your camera. Please allow camera permission.");
    }
}