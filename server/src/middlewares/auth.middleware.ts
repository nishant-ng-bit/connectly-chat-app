import express from "express";
import { verifyToken } from "../services/auth.service";

export const authMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.cookies?.token)
    return res.status(401).json({ message: "UnAuthorized" });

  const decodedId = verifyToken(req.cookies.token);
  if (!decodedId) return res.status(401).json({ message: "UnAuthorized" });

  req.user = { id: decodedId };
  next();
};
