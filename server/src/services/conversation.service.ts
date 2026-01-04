import prisma from "../lib/prisma";

export const findOrCreateConversation = async (
  senderId: string,
  receiverId: string
) => {
  const conversation = await prisma.conversation.findFirst({
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
  });

  if (conversation) {
    return conversation;
  }

  return prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: senderId }, { userId: receiverId }],
      },
    },
  });
};

export const getChatUsers = async (currentUserId: string) => {
  return prisma.conversationParticipant.findMany({
    where: {
      conversation: {
        participants: {
          some: { userId: currentUserId },
        },
      },
      userId: {
        not: currentUserId,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    distinct: ["userId"],
  });
};
