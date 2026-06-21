import { Server, Socket } from "socket.io";
import { sendMessage, toggleMessageReaction } from "../services/message.service";
import { getConversationParticipants } from "../services/conversation.service";
import prisma from "../lib/prisma";

const emitConversationUpdated = async (io: Server, conversationId: string) => {
  const participants = await getConversationParticipants(conversationId);
  participants.forEach((participant) => {
    io.to(participant.userId).emit("conversation:updated", conversationId);
  });
};

export const messageSocket = (io: Server, socket: Socket) => {
  socket.on("message:send", async (payload) => {
    try {
      const { message } = await sendMessage(payload);
      const conversationId = message.conversationId;
      socket.join(conversationId);

      await emitConversationUpdated(io, conversationId);
      io.to(conversationId).emit("message:new", message);

      if (payload.receiverId === "000000000000000000000000") {
        try {
          const { getGeminiResponse } = await import("../services/ai.service");
          io.to(payload.senderId).emit("typing:start", { userId: "000000000000000000000000" });

          const aiReply = await getGeminiResponse(conversationId, payload.content);
          io.to(payload.senderId).emit("typing:stop", { userId: "000000000000000000000000" });

          const { message: aiMessage } = await sendMessage({
            senderId: "000000000000000000000000",
            receiverId: payload.senderId,
            content: aiReply,
            type: "text",
          });

          io.to(conversationId).emit("message:new", aiMessage);
          await emitConversationUpdated(io, conversationId);
        } catch (error) {
          console.error("Error in AI message socket handler:", error);
          io.to(payload.senderId).emit("typing:stop", { userId: "000000000000000000000000" });
        }
        return;
      }

      const room = io.sockets.adapter.rooms.get(conversationId);
      const someoneElseInRoom =
        room && Array.from(room).some((id) => id !== socket.id);

      if (someoneElseInRoom) {
        const seenAt = new Date();

        prisma.message
          .update({ where: { id: message.id }, data: { seenAt } })
          .then(() => {
            io.to(conversationId).emit("message:seen", {
              conversationId,
              messageId: message.id,
              seenAt,
            });
          })
          .catch(console.error);
      }
    } catch (error) {
      console.error("message:send failed", error);
      socket.emit("message:error", { message: "Failed to send message" });
    }
  });

  socket.on("message:react", async (payload) => {
    try {
      const userId = payload.userId || socket.data?.userId;
      const message = await toggleMessageReaction({
        messageId: payload.messageId,
        userId,
        emoji: payload.emoji,
      });
      io.to(message.conversationId).emit("message:reaction", message);
    } catch (error) {
      console.error("message:react failed", error);
      socket.emit("message:error", { message: "Failed to update reaction" });
    }
  });
};

export const markMessagesAsSeenSocket = async (
  socket: Socket,
  conversationId: string,
  userId: string
) => {
  if (!conversationId) {
    return console.error("No conversationId provided");
  }
  const seenAt = new Date();

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      seenAt: { isSet: false },
    },
    data: { seenAt },
  });

  socket.to(conversationId).emit("messages:seen", {
    conversationId,
    seenAt,
  });
};
