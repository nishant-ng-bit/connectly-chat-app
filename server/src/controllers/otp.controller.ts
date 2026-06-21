import express from "express";
import { otpHandler } from "../helpers/otp.helper";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sendOtpHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    await otpHandler(email);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return res.status(500).json({ error: "Could not send OTP email. Please try again." });
  }
};
