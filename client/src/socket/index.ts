import { io } from "socket.io-client";

export const socket = io("https://connectly-chat-app.onrender.com", {
  withCredentials: true,
  autoConnect: false,
});
