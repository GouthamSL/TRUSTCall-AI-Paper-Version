const API_URL = "http://127.0.0.1:8000";

export async function analyzeFrame(image) {
  try {
    const response = await fetch(`${API_URL}/live-analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: image,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backend Error:", error);
    return null;
  }
}