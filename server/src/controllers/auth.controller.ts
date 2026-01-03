import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from "../services/user.service";
import { generateToken } from "../services/auth.service";
import { userReq } from "../interfaces/user.interface";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password }: userReq = req.body;

    const existingUserByEmail = await getUserByEmail(email);
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByEmail || existingUserByUsername) {
      return res.status(400).json({ error: "User already exists" });
    }

    // otpHandler(otp);
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
    const { username, email } = req.body;
    const userByUsername = await getUserByUsername(username);
    const userByEmail = await getUserByEmail(email);

    if (!userByUsername || !userByEmail) {
      return res.status(401).json({ message: "User Not Exist" }); //return code check!
    }

    const id = userByEmail.id;

    const jwtToken = generateToken(id);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Login successful" });
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
