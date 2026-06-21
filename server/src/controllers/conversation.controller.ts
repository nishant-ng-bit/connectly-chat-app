import express from "express";
import {
  addGroupMembers,
  clearConversation,
  createGroupConversation,
  getChatUsers,
  getConversationId,
  getConversationParticipants,
  removeGroupMember,
  renameGroupConversation,
} from "../services/conversation.service";

const handleConversationError = (error: unknown, res: express.Response) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  const badRequestErrors = new Set([
    "INVALID_GROUP_NAME",
    "GROUP_NEEDS_THREE_MEMBERS",
    "INVALID_MEMBERS",
    "NO_MEMBERS",
    "MEMBERS_ALREADY_ADDED",
    "NOT_GROUP",
  ]);
  const forbiddenErrors = new Set([
    "NOT_PARTICIPANT",
    "NOT_ADMIN",
    "CANNOT_REMOVE_LAST_ADMIN",
  ]);

  if (badRequestErrors.has(message)) return res.status(400).json({ message });
  if (forbiddenErrors.has(message)) return res.status(403).json({ message });
  console.error("Conversation error:", error);
  return res.status(500).json({ error: "Failed to process conversation request" });
};

export const getConversationsHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const conversations = await getChatUsers(req.user.id);
    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationIdHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const conversationId = await getConversationId(
      req.query.currentUserId as string,
      req.query.otherUserId as string
    );
    return res.status(200).json(conversationId);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch conversation id" });
  }
};

export const createGroupConversationHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const group = await createGroupConversation({
      creatorId: req.user.id,
      name: req.body.name || "",
      memberIds: req.body.memberIds || [],
    });
    return res.status(201).json(group);
  } catch (error) {
    return handleConversationError(error, res);
  }
};

export const renameGroupConversationHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const group = await renameGroupConversation({
      conversationId: req.params.conversationId,
      userId: req.user.id,
      name: req.body.name || "",
    });
    return res.status(200).json(group);
  } catch (error) {
    return handleConversationError(error, res);
  }
};

export const addGroupMembersHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const participants = await addGroupMembers({
      conversationId: req.params.conversationId,
      requesterId: req.user.id,
      memberIds: req.body.memberIds || [],
    });
    return res.status(200).json(participants);
  } catch (error) {
    return handleConversationError(error, res);
  }
};

export const removeGroupMemberHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const participants = await removeGroupMember({
      conversationId: req.params.conversationId,
      requesterId: req.user.id,
      memberId: req.params.memberId,
    });
    return res.status(200).json(participants);
  } catch (error) {
    return handleConversationError(error, res);
  }
};

export const getGroupParticipantsHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const participants = await getConversationParticipants(req.params.conversationId);
    return res.status(200).json(participants);
  } catch (error) {
    return handleConversationError(error, res);
  }
};

export const clearConversationHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    if (!conversationId || !userId) return res.status(400).json({ message: "Bad request" });
    await clearConversation(conversationId, userId);
    return res.status(200).json({ message: "Conversation cleared successfully" });
  } catch (error) {
    return handleConversationError(error, res);
  }
};
