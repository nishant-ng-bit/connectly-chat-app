import express from "express";
import { login, logout, register } from "../controllers/auth.controller";
import { verifyOtpMiddleware } from "../middlewares/otp.middleware";
import { sendOtpHandler } from "../controllers/otp.controller";
export const authRoute = (router: express.Router) => {
  router.post("/auth/request-otp", sendOtpHandler);
  router.post("/auth/register", verifyOtpMiddleware, register);
  router.post("/auth/login", login);
  router.post("/auth/logout", logout);
};
