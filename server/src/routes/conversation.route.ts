import express from "express";
import {
  addGroupMembersHandler,
  clearConversationHandler,
  createGroupConversationHandler,
  getConversationIdHandler,
  getConversationsHandler,
  getGroupParticipantsHandler,
  removeGroupMemberHandler,
  renameGroupConversationHandler,
} from "../controllers/conversation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const conversationRoute = (router: express.Router) => {
  router.get("/conversations", authMiddleware, getConversationsHandler);
  router.get("/conversation/id", authMiddleware, getConversationIdHandler);
  router.post("/conversations/groups", authMiddleware, createGroupConversationHandler);
  router.get("/conversations/:conversationId/participants", authMiddleware, getGroupParticipantsHandler);
  router.patch("/conversations/:conversationId/groups", authMiddleware, renameGroupConversationHandler);
  router.post("/conversations/:conversationId/participants", authMiddleware, addGroupMembersHandler);
  router.delete("/conversations/:conversationId/participants/:memberId", authMiddleware, removeGroupMemberHandler);
  router.post(
    "/conversations/:conversationId/clear",
    authMiddleware,
    clearConversationHandler
  );
};
