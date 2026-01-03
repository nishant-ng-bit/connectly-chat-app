import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOTP = async (to: string, OTP: string) => {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "OTP Verification",
    html: `<h1>OTP: ${OTP}</h1>`,
  });
};

export const generateOTP = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
