import express from "express";
import {
  isLoggedIn,
  login,
  logout,
  register,
  guestLogin,
  checkUsernameAvailability,
} from "../controllers/auth.controller";
import { verifyOtpMiddleware } from "../middlewares/otp.middleware";
import { sendOtpHandler } from "../controllers/otp.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
export const authRoute = (router: express.Router) => {
  router.get("/auth/check-username", checkUsernameAvailability);
  router.post("/auth/request-otp", sendOtpHandler);
  router.post("/auth/register", verifyOtpMiddleware, register);
  router.post("/auth/login", verifyOtpMiddleware, login);
  router.post("/auth/guest-login", guestLogin);
  router.post("/auth/logout", authMiddleware, logout);
  router.get("/auth/me", authMiddleware, isLoggedIn);
};
