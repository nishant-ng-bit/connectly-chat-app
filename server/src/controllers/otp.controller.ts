import express from "express";
import { otpHandler } from "../helpers/otp.helper";
export const sendOtpHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const email: string = req.body.email;
    otpHandler(email);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
