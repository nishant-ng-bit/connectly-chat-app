import express from "express";
import { verifyOTP } from "../helpers/otp.helper";

export const verifyOtpMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const isVerified = await verifyOTP(req.body.email, req.body.otp);
    if (!isVerified) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
