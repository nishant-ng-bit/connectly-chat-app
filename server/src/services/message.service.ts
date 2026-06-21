import prisma from "../lib/prisma";
import {
  assertParticipant,
  findConversation,
  findOrCreateConversation,
} from "./conversation.service";

interface msg {
  senderId: string;
  receiverId?: string;
  conversationId?: string;
  content?: string;
  mediaUrl?: string;
  type: "text" | "image" | "video";
}

export const sendMessage = async ({
  senderId,
  receiverId,
  conversationId,
  content,
  mediaUrl,
  type,
}: msg) => {
  let targetConversationId = conversationId;
  let isFirstMsg = false;

  if (targetConversationId) {
    await assertParticipant(targetConversationId, senderId);
    await prisma.conversation.update({
      where: { id: targetConversationId },
      data: { lastModified: new Date() },
    });
  } else {
    if (!receiverId) throw new Error("MISSING_RECEIVER");
    const result = await findOrCreateConversation(senderId, receiverId);
    targetConversationId = result.conversation.id;
    isFirstMsg = result.isFirstMsg;
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      content: content || null,
      conversationId: targetConversationId,
      mediaUrl: mediaUrl || null,
      type,
      reactions: {},
    },
  });

  return { message, isFirstMsg };
};

export const getMessages = async ({
  currentUserId,
  otherUserId,
  conversationId,
}: {
  currentUserId: string;
  otherUserId?: string;
  conversationId?: string;
}) => {
  let targetConversationId = conversationId;

  if (targetConversationId) {
    await assertParticipant(targetConversationId, currentUserId);
  } else if (otherUserId) {
    const conversation = await findConversation(currentUserId, otherUserId);
    if (!conversation) return [];
    targetConversationId = conversation.id;
  } else {
    return [];
  }

  return prisma.message.findMany({
    where: { conversationId: targetConversationId },
    orderBy: { createdAt: "asc" },
  });
};

export const toggleMessageReaction = async ({
  messageId,
  userId,
  emoji,
}: {
  messageId: string;
  userId: string;
  emoji: string;
}) => {
  const cleanEmoji = emoji.trim();
  if (!cleanEmoji) throw new Error("INVALID_EMOJI");

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("MESSAGE_NOT_FOUND");
  await assertParticipant(message.conversationId, userId);

  const reactions = ((message.reactions as Record<string, string[]> | null) || {});
  const currentUsers = new Set(reactions[cleanEmoji] || []);
  if (currentUsers.has(userId)) currentUsers.delete(userId);
  else currentUsers.add(userId);

  const nextReactions = { ...reactions };
  if (currentUsers.size) nextReactions[cleanEmoji] = Array.from(currentUsers);
  else delete nextReactions[cleanEmoji];

  return prisma.message.update({
    where: { id: messageId },
    data: { reactions: nextReactions },
  });
};

export const deleteMsgForUser = async ({
  messageId,
  userId,
}: {
  messageId: string;
  userId: string;
}) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("MESSAGE_NOT_FOUND");
  await assertParticipant(message.conversationId, userId);

  return prisma.message.update({
    where: { id: messageId },
    data: { deletedFor: { push: userId } },
  });
};
