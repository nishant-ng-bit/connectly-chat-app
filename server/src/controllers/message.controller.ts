import express from "express";
import {
  deleteMsgForUser,
  getMessages,
  sendMessage,
} from "../services/message.service";

export const sendMessageHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const message = await sendMessage(req.body);
    return res.status(201).json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getMessagesHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const messages = await getMessages(req.body);
    return res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const deleteMsgForUserHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const message = await deleteMsgForUser(req.body);
    console.log("inside controller", message);
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to delete message" });
  }
};
