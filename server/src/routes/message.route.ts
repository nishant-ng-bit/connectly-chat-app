import express from "express";
import {
  deleteMsgForUserHandler,
  getMessagesHandler,
  sendMessageHandler,
} from "../controllers/message.controller";
import multer from "multer";
import { uploaderHandler } from "../controllers/uploader.controller";

const upload = multer({ dest: "tmp/" });
export const messageRoute = (router: express.Router) => {
  router.post("/msg/send", sendMessageHandler);
  router.post("/msg/get", getMessagesHandler);
  router.post("/msg/upload", upload.single("file"), uploaderHandler);
  router.post("/msg/delete", deleteMsgForUserHandler);
};
