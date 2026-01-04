import prisma from "../lib/prisma";
import { findOrCreateConversation } from "./conversation.service";

interface msg {
  senderId: string;
  receiverId: string;
  content: string;
}
export const sendMessage = async ({ senderId, receiverId, content }: msg) => {
  const conversation = await findOrCreateConversation(senderId, receiverId);
  return prisma.message.create({
    data: { senderId, content, conversationId: conversation.id },
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
