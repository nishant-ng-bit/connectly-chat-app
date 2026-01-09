import { Server, Socket } from "socket.io";
import { sendMessage } from "../services/message.service";
import prisma from "../lib/prisma";

export const messageSocket = (io: Server, socket: Socket) => {
  socket.on("message:send", async (payload) => {
    const { message, isFirstMsg } = await sendMessage(payload);

    const conversationId = message.conversationId;

    if (isFirstMsg) {
      io.to(payload.receiverId).emit("conversation:first-message", {
        conversationId,
      });
    }

    io.to(conversationId).emit("message:new", message);

    const room = io.sockets.adapter.rooms.get(conversationId);
    const someoneElseInRoom =
      room && Array.from(room).some((id) => id !== socket.id);

    if (someoneElseInRoom) {
      const seenAt = new Date();

      prisma.message
        .update({
          where: { id: message.id },
          data: { seenAt },
        })
        .then(() => {
          io.to(conversationId).emit("message:seen", {
            conversationId,
            messageId: message.id,
            seenAt,
          });
        })
        .catch(console.error);
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
