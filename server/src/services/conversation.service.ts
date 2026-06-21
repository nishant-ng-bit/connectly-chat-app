import prisma from "../lib/prisma";

const AI_ID = "000000000000000000000000";

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
        isGroup: false,
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

export const assertParticipant = async (conversationId: string, userId: string) => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });

  if (!participant) {
    throw new Error("NOT_PARTICIPANT");
  }

  return participant;
};

const assertAdmin = async (conversationId: string, userId: string) => {
  const participant = await assertParticipant(conversationId, userId);
  if (participant.role !== "admin") {
    throw new Error("NOT_ADMIN");
  }
  return participant;
};

export const getConversationParticipants = async (conversationId: string) => {
  return prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
};

export const getChatUsers = async (currentUserId: string) => {
  if (currentUserId !== AI_ID) {
    try {
      await findOrCreateConversation(currentUserId, AI_ID);
    } catch (err) {
      console.error("Failed to auto-create AI conversation:", err);
    }
  }

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
      isGroup: true,
      name: true,
      image: true,
      createdById: true,
      participants: {
        select: {
          role: true,
          user: true,
        },
      },
    },
  });

  return conversations.map((conv) => {
    if (conv.isGroup) {
      return {
        conversationId: conv.id,
        isGroup: true,
        name: conv.name || "Untitled group",
        image: conv.image || null,
        createdById: conv.createdById,
        participants: conv.participants,
      };
    }

    const otherParticipant = conv.participants.find(
      (participant) => participant.user.id !== currentUserId
    );

    return {
      conversationId: conv.id,
      isGroup: false,
      user: otherParticipant?.user,
      participants: conv.participants,
    };
  }).filter((conv) => conv.isGroup || conv.user);
};

export const findConversation = async (
  senderId: string,
  receiverId: string
) => {
  return await prisma.conversation.findFirst({
    where: {
      isGroup: false,
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

export const createGroupConversation = async ({
  creatorId,
  name,
  memberIds,
}: {
  creatorId: string;
  name: string;
  memberIds: string[];
}) => {
  const cleanName = name.trim();
  const uniqueMemberIds = Array.from(new Set([creatorId, ...memberIds.filter(Boolean)]));

  if (cleanName.length < 2) throw new Error("INVALID_GROUP_NAME");
  if (uniqueMemberIds.length < 3) throw new Error("GROUP_NEEDS_THREE_MEMBERS");

  const users = await prisma.user.findMany({
    where: { id: { in: uniqueMemberIds } },
    select: { id: true },
  });

  if (users.length !== uniqueMemberIds.length) throw new Error("INVALID_MEMBERS");

  return prisma.conversation.create({
    data: {
      isGroup: true,
      name: cleanName,
      createdById: creatorId,
      participants: {
        create: uniqueMemberIds.map((userId) => ({
          userId,
          role: userId === creatorId ? "admin" : "member",
        })),
      },
    },
    include: {
      participants: { select: { userId: true, role: true, user: true } },
    },
  });
};

export const renameGroupConversation = async ({
  conversationId,
  userId,
  name,
}: {
  conversationId: string;
  userId: string;
  name: string;
}) => {
  await assertAdmin(conversationId, userId);
  const cleanName = name.trim();
  if (cleanName.length < 2) throw new Error("INVALID_GROUP_NAME");

  return prisma.conversation.update({
    where: { id: conversationId, isGroup: true },
    data: { name: cleanName, lastModified: new Date() },
  });
};

export const addGroupMembers = async ({
  conversationId,
  requesterId,
  memberIds,
}: {
  conversationId: string;
  requesterId: string;
  memberIds: string[];
}) => {
  await assertAdmin(conversationId, requesterId);
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation?.isGroup) throw new Error("NOT_GROUP");

  const uniqueIds = Array.from(new Set(memberIds.filter(Boolean))).filter(
    (userId) => userId !== requesterId
  );
  if (!uniqueIds.length) throw new Error("NO_MEMBERS");

  const existing = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { in: uniqueIds } },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((item) => item.userId));
  const idsToAdd = uniqueIds.filter((userId) => !existingIds.has(userId));
  if (!idsToAdd.length) throw new Error("MEMBERS_ALREADY_ADDED");

  const users = await prisma.user.findMany({
    where: { id: { in: idsToAdd } },
    select: { id: true },
  });
  if (users.length !== idsToAdd.length) throw new Error("INVALID_MEMBERS");

  await prisma.conversationParticipant.createMany({
    data: idsToAdd.map((userId) => ({ conversationId, userId, role: "member" })),
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastModified: new Date() } });
  return getConversationParticipants(conversationId);
};

export const removeGroupMember = async ({
  conversationId,
  requesterId,
  memberId,
}: {
  conversationId: string;
  requesterId: string;
  memberId: string;
}) => {
  const target = await assertParticipant(conversationId, memberId);
  const isSelfLeaving = requesterId === memberId;
  if (!isSelfLeaving) await assertAdmin(conversationId, requesterId);

  const admins = await prisma.conversationParticipant.findMany({
    where: { conversationId, role: "admin" },
    select: { userId: true },
  });
  if (target.role === "admin" && admins.length <= 1) throw new Error("CANNOT_REMOVE_LAST_ADMIN");

  await prisma.conversationParticipant.delete({ where: { id: target.id } });
  const remaining = await prisma.conversationParticipant.count({ where: { conversationId } });
  if (remaining === 0) {
    await prisma.conversation.delete({ where: { id: conversationId } });
    return [];
  }
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastModified: new Date() } });
  return getConversationParticipants(conversationId);
};

export const clearConversation = async (
  conversationId: string,
  userId: string
) => {
  await assertParticipant(conversationId, userId);
  return prisma.message.updateMany({
    where: { conversationId },
    data: { deletedFor: { push: userId } },
  });
};
