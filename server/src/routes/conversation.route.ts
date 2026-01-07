import express from "express";
import {
  getConversationIdHandler,
  getConversationsHandler,
} from "../controllers/conversation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const conversationRoute = (router: express.Router) => {
  router.get("/conversations", authMiddleware, getConversationsHandler);
  router.get("/conversation/id", getConversationIdHandler);
};
