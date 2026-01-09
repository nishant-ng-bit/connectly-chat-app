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
  const { conversation, isFirstMsg } = await findOrCreateConversation(
    senderId,
    receiverId
  );
  const message = await prisma.message.create({
    data: {
      senderId,
      content: content || null,
      conversationId: conversation.id,
      mediaUrl: mediaUrl || null,
      type,
    },
  });

  return { message, isFirstMsg };
};

export const getMessages = async ({
  currentUserId,
  otherUserId,
}: {
  currentUserId: string;
  otherUserId: string;
}) => {
  const { conversation } = await findOrCreateConversation(
    currentUserId,
    otherUserId
  );
  return prisma.message.findMany({
    where: { conversationId: conversation.id },
  });
};

export const deleteMsgForUser = async ({
  messageId,
  userId,
}: {
  messageId: string;
  userId: string;
}) => {
  return prisma.message.update({
    where: { id: messageId },
    data: { deletedFor: { push: userId } },
  });
};
