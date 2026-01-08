import prisma from "../lib/prisma";
import { findOrCreateConversation } from "./conversation.service";

interface msg {
  senderId: string;
  receiverId: string;
  content?: string;
  mediaUrl?: string;
  type: "text" | "image" | "video";
}
export const sendMessage = async ({
  senderId,
  receiverId,
  content,
  mediaUrl,
  type,
}: msg) => {
  const conversation = await findOrCreateConversation(senderId, receiverId);
  return prisma.message.create({
    data: {
      senderId,
      content: content || null,
      conversationId: conversation.id,
      mediaUrl: mediaUrl || null,
      type,
    },
  });
};

export const getMessages = async ({ currentUserId, otherUserId }) => {
  const conversation = await findOrCreateConversation(
    currentUserId,
    otherUserId
  );
  return prisma.message.findMany({
    where: { conversationId: conversation.id },
  });
};

export const deleteMsgForUser = async ({ messageId, userId }) => {
  return prisma.message.update({
    where: { id: messageId },
    data: { deletedFor: { push: userId } },
  });
};
