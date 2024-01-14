import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WS_URL || "https://localhost:8080", {
  transports: ["websocket"],
});

export default socket;
