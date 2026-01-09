import prisma from "../lib/prisma";

export const findOrCreateConversation = async (
  senderId: string,
  receiverId: string
) => {
  let conversation = await prisma.conversation.findFirst({
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

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: senderId }, { userId: receiverId }],
        },
      },
    });
  }

  return conversation;
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
      conversationId: true,
      user: true,
    },
    distinct: ["userId"],
  });
};

export const getConversationId = async (
  currentUserId: string,
  otherUserId: string
) => {
  const conversation = await findOrCreateConversation(
    currentUserId,
    otherUserId
  );
  console.log("conversation", conversation);
  return conversation.id;
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
