import { Server, Socket } from "socket.io";
import { sendMessage } from "../services/message.service";
import prisma from "../lib/prisma";

export const messageSocket = (io: Server, socket: Socket) => {
  socket.on("message:send", async (payload) => {
    const { conversationId } = payload;

    const msg = await sendMessage(payload);

    io.to(conversationId).emit("message:new", msg);

    const room = io.sockets.adapter.rooms.get(conversationId);
    const someoneElseInRoom =
      room && Array.from(room).some((id) => id !== socket.id);

    if (someoneElseInRoom) {
      const seenAt = new Date();

      prisma.message
        .update({
          where: { id: msg.id },
          data: { seenAt },
        })
        .then(() => {
          io.to(conversationId).emit("message:seen", {
            conversationId,
            messageId: msg.id,
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
    console.log("conversationId not found");
    return;
  }
  const seenAt = new Date();

  const res = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      seenAt: { isSet: false },
    },
    data: { seenAt },
  });

  console.log("res", res);
  socket.to(conversationId).emit("messages:seen", {
    conversationId,
    seenAt,
  });
};
