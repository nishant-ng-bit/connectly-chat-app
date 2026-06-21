import express from "express";
import { randomUUID } from "crypto";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
} from "../services/user.service";
import { generateToken, verifyToken } from "../services/auth.service";
import { userReq } from "../interfaces/user.interface";

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
} as const;
const authCookieMaxAge = 7 * 24 * 60 * 60 * 1000;
const guestCookieName = "connectly_guest_id";

const normalizeGuestKey = (value?: string) => {
  if (!value) return null;
  return /^[a-f0-9-]{36}$/i.test(value) ? value.toLowerCase() : null;
};

const guestAdjectives = [
  "calm",
  "bright",
  "fresh",
  "kind",
  "swift",
  "happy",
  "soft",
  "cool",
  "sunny",
  "neat",
];
const guestNouns = [
  "spark",
  "wave",
  "leaf",
  "note",
  "pixel",
  "beam",
  "trail",
  "cloud",
  "bloom",
  "echo",
];

const getGuestIdentity = (req: express.Request) => {
  const guestKey = normalizeGuestKey(req.cookies?.[guestCookieName]) ?? randomUUID();

  return {
    guestKey,
    email: `guest-${guestKey}@guests.connectly.local`,
  };
};

const generateGuestUsername = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const adjective = guestAdjectives[Math.floor(Math.random() * guestAdjectives.length)];
    const noun = guestNouns[Math.floor(Math.random() * guestNouns.length)];
    const number = Math.floor(100 + Math.random() * 900);
    const username = `${adjective}${noun}${number}`;

    const existingUser = await getUserByUsername(username);
    if (!existingUser) return username;
  }

  return `user${randomUUID().replace(/-/g, "").slice(0, 8)}`;
};

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
      ...authCookieOptions,
      maxAge: authCookieMaxAge,
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
      ...authCookieOptions,
      maxAge: authCookieMaxAge,
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

    const guest = getGuestIdentity(req);
    let user = await getUserByEmail(guest.email);

    if (!user) {
      user = await createUser({
        username: await generateGuestUsername(),
        email: guest.email,
      });
    }

    const jwtToken = generateToken(user.id);
    res.cookie(guestCookieName, guest.guestKey, {
      ...authCookieOptions,
      maxAge: authCookieMaxAge,
    });
    res.cookie("token", jwtToken, {
      ...authCookieOptions,
      maxAge: authCookieMaxAge,
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
    res.clearCookie("token", authCookieOptions);
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

export const checkUsernameAvailability = async (
  req: express.Request,
  res: express.Response
) => {
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
