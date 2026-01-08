import express from "express";
import {
  clearConversation,
  getChatUsers,
  getConversationId,
} from "../services/conversation.service";

export const getConversationsHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const conversations = await getChatUsers(userId);

    if (!conversations) {
      return res.status(404).json({ message: "Conversations not found" });
    }

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      error: "Failed to fetch conversations",
    });
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
    return res.status(500).json({
      error: "Failed to fetch conversation id",
    });
  }
};

export const clearConversationHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    if (!conversationId || !userId)
      return res.status(400).json({ message: "Bad request" });

    await clearConversation(conversationId, userId);
    return res
      .status(200)
      .json({ message: "Conversation cleared successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to clear conversation" });
  }
};
