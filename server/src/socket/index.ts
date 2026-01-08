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
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return;

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
      // console.log("🟢 Socket joined conversation:", conversationId);
      socket.join(conversationId);
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(conversationId);
      // console.log(`🟡 Socket ${socket.id} left room ${conversationId}`);
    });

    socket.on("typing:start", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:start", {
        userId,
        conversationId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:stop", {
        userId,
        conversationId,
      });
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
