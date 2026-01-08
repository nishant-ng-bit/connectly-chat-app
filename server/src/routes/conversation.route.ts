import express from "express";
import {
  clearConversationHandler,
  getConversationIdHandler,
  getConversationsHandler,
} from "../controllers/conversation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const conversationRoute = (router: express.Router) => {
  router.get("/conversations", authMiddleware, getConversationsHandler);
  router.get("/conversation/id", authMiddleware, getConversationIdHandler);
  router.post(
    "/conversations/:conversationId/clear",
    authMiddleware,
    clearConversationHandler
  );
};
