import express from "express";
import { sendMessage } from "../services/message.service";

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
