import express from "express";
import {
  getUserById,
  getUserByQuery,
  setProfilePic,
} from "../services/user.service";

export const getUserByQueryHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUserByQuery(req.query.username as string);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const setProfilePicHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const profilePic = req.file;
    const { userId } = req.body;

    if (!userId || !profilePic)
      return res.status(400).json({ message: "Bad request" });

    const updatedUser = await setProfilePic(userId, profilePic);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserByIdHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId } = req.params;

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
