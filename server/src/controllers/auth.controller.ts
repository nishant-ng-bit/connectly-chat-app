import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
} from "../services/user.service";
import { generateToken, verifyToken } from "../services/auth.service";
import { userReq } from "../interfaces/user.interface";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password }: userReq = req.body;

    const existingUserByEmail = await getUserByEmail(email);
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByEmail || existingUserByUsername) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await createUser({ username, email, password });

    const jwtToken = generateToken(user.id);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    if (req.cookies.token) {
      return res.status(401).json({ message: "User Already LoggedIN" });
    }
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "User Not Exist" });
    }

    const id = user.id;

    const jwtToken = generateToken(id);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.cookies.token) {
      return res.status(401).json({ message: "Invalid req" });
    }
    res.clearCookie("token");
    res.status(200).json({ error: "Successfully logout" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
export const isLoggedIn = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decodedId = verifyToken(token);
    if (!decodedId) {
      console.log("Invalid token");
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await getUserById(decodedId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};
