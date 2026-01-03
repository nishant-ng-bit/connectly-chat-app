import express from "express";
import { sendMessageHandler } from "../controllers/message.controller";

export const messageRoute = (router: express.Router) => {
  router.post("/send", sendMessageHandler);
};
