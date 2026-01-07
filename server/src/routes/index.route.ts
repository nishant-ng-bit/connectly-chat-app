import express from "express";
import { messageRoute } from "./message.route";
import { authRoute } from "./auth.route";
import { conversationRoute } from "./conversation.route";
import { userRoute } from "./user.route";

const router = express.Router();

export default (): express.Router => {
  authRoute(router);
  messageRoute(router);
  conversationRoute(router);
  userRoute(router);
  return router;
};
