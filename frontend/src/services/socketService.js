import { io } from "socket.io-client";

const communicationUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:3002"
    : import.meta.env.VITE_COMMUNICATION_URL;

const socket = io(communicationUrl, {
  autoConnect: false,

  // Start with polling because ngrok/browser
  // connectivity is currently being tested through
  // HTTP polling.
  transports: ["polling", "websocket"],

  // Send the ngrok bypass parameter with the
  // Socket.IO connection.
  query: {
    "ngrok-skip-browser-warning": "true",
  },

  // Credentials are required by the communication
  // server CORS configuration.
  withCredentials: true,

  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  timeout: 20000,
});

export default socket;