const API_URL = "http://localhost:3001";

export async function createMeeting() {
  const response = await fetch(`${API_URL}/api/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error("Failed to create meeting");
  }

  return response.json();
}

export async function checkMeeting(meetingId) {
  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId.toUpperCase()}`
  );

  if (!response.ok) {
    throw new Error("Meeting not found");
  }

  return response.json();
}
