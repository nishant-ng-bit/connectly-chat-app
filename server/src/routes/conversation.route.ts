import express from "express";
import { getConversationsHandler } from "../controllers/conversation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const conversationRoute = (router: express.Router) => {
  router.get("/conversations", authMiddleware, getConversationsHandler);
};
