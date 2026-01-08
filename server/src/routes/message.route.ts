import express from "express";
import {
  deleteMsgForUserHandler,
  getMessagesHandler,
  sendMessageHandler,
} from "../controllers/message.controller";
import multer from "multer";
import { uploaderHandler } from "../controllers/uploader.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const upload = multer({ dest: "tmp/" });
export const messageRoute = (router: express.Router) => {
  router.post("/msg/send", authMiddleware, sendMessageHandler);
  router.post("/msg/get", authMiddleware, getMessagesHandler);
  router.post(
    "/msg/upload",
    authMiddleware,
    upload.single("file"),
    uploaderHandler
  );
  router.post("/msg/delete", authMiddleware, deleteMsgForUserHandler);
};
