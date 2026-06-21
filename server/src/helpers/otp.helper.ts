import { generateOTP, sendOTP } from "../services/mail.service";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

export const otpHandler = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOTP();

  await sendOTP(normalizedEmail, otp);

  const hashedOTP = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.deleteMany({ where: { email: normalizedEmail } });
  await prisma.otp.create({
    data: {
      email: normalizedEmail,
      hashedOTP,
      expiresAt,
    },
  });

  return otp;
};

export const verifyOTP = async (email: string, otp: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otpData = await prisma.otp.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!otpData) {
    console.log("OTP not found");
    return false;
  }

  if (otpData.expiresAt < new Date()) {
    console.log("OTP expired");
    return false;
  }

  const isValid = await bcrypt.compare(otp.trim(), otpData.hashedOTP);

  if (!isValid) {
    console.log("Invalid OTP");
    return false;
  }

  await prisma.otp.deleteMany({ where: { email: normalizedEmail } });
  return true;
};
