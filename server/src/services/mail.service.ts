import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOTP = async (to: string, OTP: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Connectly App" <${process.env.MAIL_USER}>`,
      to,
      subject: "Your Connectly OTP Verification Code",
      text: `Hello, your OTP for verification is ${OTP}. This code is valid for 10 minutes. Please do not share it with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Connectly Chat App - OTP Verification</h2>
          <p>Hello,</p>
          <p>You requested an OTP for verification. Your One-Time Password is:</p>
          <h1 style="color: #4A90E2; letter-spacing: 2px;">${OTP}</h1>
          <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p>Best regards,<br/>The Connectly Team</p>
        </div>
      `,
    });
    console.log("Mail sent successfully:", info.messageId);
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw error;
  }
};

export const generateOTP = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
