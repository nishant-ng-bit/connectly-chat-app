import express from "express";
import { getUserByQuery, setProfilePic } from "../services/user.service";

export const getUserByQueryHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUserByQuery(req.query.username as string);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
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
      return res.status(400).json({ error: "Bad request" });

    await setProfilePic(userId, profilePic);
    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
