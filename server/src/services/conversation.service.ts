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
