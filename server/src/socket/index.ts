import { Server } from "socket.io";
import http from "http";
import { markMessagesAsSeenSocket, messageSocket } from "./message.socket";
import {
  addOnlineUser,
  isUserOnline,
  onlineUsers,
  removeOnlineUser,
} from "./user.socket";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return;
    socket.join(userId);

    addOnlineUser(userId, socket.id);

    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit("presence:sync", onlineUserIds);

    socket.broadcast.emit("presence:update", {
      userId,
      online: true,
    });

    messageSocket(io, socket);

    socket.on("conversation:opened", async ({ conversationId }) => {
      await markMessagesAsSeenSocket(socket, conversationId, userId);
    });

    socket.on("join:conversation", async (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on("typing:start", ({ receiverId }) => {
      socket.to(receiverId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ receiverId }) => {
      socket.to(receiverId).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      removeOnlineUser(userId, socket.id);

      if (!isUserOnline(userId))
        io.emit("presence:update", { userId, online: false });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
