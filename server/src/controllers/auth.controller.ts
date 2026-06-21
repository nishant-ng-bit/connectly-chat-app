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
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
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
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const guestLogin = async (req: express.Request, res: express.Response) => {
  try {
    if (req.cookies.token) {
      return res.status(401).json({ message: "User Already LoggedIN" });
    }
    const guestEmail = "guest@connectly.com";
    let user = await getUserByEmail(guestEmail);

    if (!user) {
      user = await createUser({
        username: `guest_${Math.floor(Math.random() * 10000)}`,
        email: guestEmail,
        password: "GuestPassword123!",
      });
    }

    const jwtToken = generateToken(user.id);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ message: "Successfully logout" });
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

export const checkUsernameAvailability = async (req: express.Request, res: express.Response) => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await getUserByUsername(username.trim());
    return res.status(200).json({ available: !user });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
