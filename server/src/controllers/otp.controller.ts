import express from "express";
import { otpHandler } from "../helpers/otp.helper";
export const sendOtpHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const email: string = req.body.email;
    const otp = await otpHandler(email);
    return res.status(200).json(otp);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
