import express from "express";
import {
  getMessagesHandler,
  sendMessageHandler,
} from "../controllers/message.controller";

export const messageRoute = (router: express.Router) => {
  router.post("/msg/send", sendMessageHandler);
  router.post("/msg/get", getMessagesHandler);
};
