import { uploader } from "../services/uploader.service";
import express from "express";

export const uploaderHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const data = await uploader(req.file);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};
