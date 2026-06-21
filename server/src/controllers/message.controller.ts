import express from "express";
import {
  deleteMsgForUser,
  getMessages,
  sendMessage,
  toggleMessageReaction,
} from "../services/message.service";
import { refineMessageText } from "../services/ai.service";

const handleMessageError = (error: unknown, res: express.Response) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  if (["NOT_PARTICIPANT"].includes(message)) return res.status(403).json({ message });
  if (["MISSING_RECEIVER", "INVALID_EMOJI", "MESSAGE_NOT_FOUND"].includes(message)) {
    return res.status(400).json({ message });
  }
  console.log(error);
  return res.status(500).json({ error: "Something went wrong" });
};

export const sendMessageHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const message = await sendMessage({ ...req.body, senderId: req.user?.id || req.body.senderId });
    return res.status(201).json(message);
  } catch (error) {
    return handleMessageError(error, res);
  }
};

export const getMessagesHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const messages = await getMessages({ ...req.body, currentUserId: req.user?.id || req.body.currentUserId });
    return res.status(200).json(messages);
  } catch (error) {
    return handleMessageError(error, res);
  }
};

export const reactToMessageHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const message = await toggleMessageReaction({
      messageId: req.params.messageId,
      userId: req.user.id,
      emoji: req.body.emoji,
    });
    return res.status(200).json(message);
  } catch (error) {
    return handleMessageError(error, res);
  }
};


export const refineMessageTextHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const refinedText = await refineMessageText(req.body.text || "");
    return res.status(200).json({ text: refinedText });
  } catch (error) {
    return handleMessageError(error, res);
  }
};

export const deleteMsgForUserHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    await deleteMsgForUser({ ...req.body, userId: req.user?.id || req.body.userId });
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    return handleMessageError(error, res);
  }
};
