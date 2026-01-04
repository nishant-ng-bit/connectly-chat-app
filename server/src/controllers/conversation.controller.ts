import express from "express";
import { getChatUsers } from "../services/conversation.service";

export const getConversationsHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const conversations = await getChatUsers(userId);

    if (!conversations) {
      return res.status(404).json({ error: "Conversations not found" });
    }

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      error: "Failed to fetch conversations",
    });
  }
};
