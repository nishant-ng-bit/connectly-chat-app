import prisma from "../lib/prisma";

export const findOrCreateConversation = async (
  senderId: string,
  receiverId: string
) => {
  let isFirstMsg = false;
  let conversation = await findConversation(senderId, receiverId);

  if (!conversation) {
    isFirstMsg = true;
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: senderId }, { userId: receiverId }],
        },
      },
    });
  }

  conversation = await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastModified: new Date() },
  });

  return { conversation, isFirstMsg };
};

export const getChatUsers = async (currentUserId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: currentUserId },
      },
    },
    orderBy: {
      lastModified: "desc",
    },
    select: {
      id: true,
      participants: {
        where: {
          userId: { not: currentUserId },
        },
        select: {
          user: true,
        },
      },
    },
  });

  return conversations.map((conv) => ({
    conversationId: conv.id,
    user: conv.participants[0].user,
  }));
};

export const findConversation = async (
  senderId: string,
  receiverId: string
) => {
  return await prisma.conversation.findFirst({
    where: {
      participants: {
        some: { userId: senderId },
      },
      AND: {
        participants: {
          some: { userId: receiverId },
        },
      },
    },
    orderBy: { lastModified: "desc" },
  });
};

export const getConversationId = async (
  currentUserId: string,
  otherUserId: string
) => {
  const conversation = await findConversation(currentUserId, otherUserId);
  return conversation?.id;
};

export const clearConversation = async (
  conversationId: string,
  userId: string
) => {
  return prisma.message.updateMany({
    where: { conversationId },
    data: { deletedFor: { push: userId } },
  });
};
