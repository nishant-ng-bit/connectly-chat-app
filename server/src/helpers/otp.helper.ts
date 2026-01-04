import { generateOTP, sendOTP } from "../services/mail.service";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
export const otpHandler = async (email: string) => {
  const otp = generateOTP();

  const hashedOTP = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10minutes

  await prisma.otp.deleteMany({ where: { email } });
  await prisma.otp.create({
    data: {
      email,
      hashedOTP,
      expiresAt,
    },
  });

  await sendOTP(email, otp);
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const otpData = await prisma.otp.findUnique({
      where: {
        email,
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

    const isValid = await bcrypt.compare(otp, otpData.hashedOTP);

    if (!isValid) {
      console.log("Invalid OTP");
      return false;
    }

    await prisma.otp.deleteMany({ where: { email } });
    return true;
  } catch (error) {
    console.log("Something went wrong", error);
  }
};
