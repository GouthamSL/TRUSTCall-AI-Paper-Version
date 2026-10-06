import axios from "axios";

const API_URL =
  import.meta.env.VITE_COMMUNICATION_URL ||
  "https://sublime-succulent-relenting.ngrok-free.dev";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 20000,
});

export default api;

