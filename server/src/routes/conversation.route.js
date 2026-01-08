"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRoute = void 0;
var conversation_controller_1 = require("../controllers/conversation.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var conversationRoute = function (router) {
    router.get("/conversations", auth_middleware_1.authMiddleware, conversation_controller_1.getConversationsHandler);
    router.get("/conversation/id", auth_middleware_1.authMiddleware, conversation_controller_1.getConversationIdHandler);
    router.post("/conversations/:conversationId/clear", auth_middleware_1.authMiddleware, conversation_controller_1.clearConversationHandler);
};
exports.conversationRoute = conversationRoute;
