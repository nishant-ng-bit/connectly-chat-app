import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const mailUser = process.env.MAIL_USER?.trim();
const mailPass = process.env.MAIL_PASS?.trim();
const mailFrom = process.env.MAIL_FROM?.trim() || mailUser;

const getTransportOptions = (): SMTPTransport.Options => {
  if (!mailUser || !mailPass) {
    throw new Error("MAIL_USER and MAIL_PASS must be set before sending OTP email");
  }

  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    };
  }

  return {
    service: "gmail",
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  };
};

const transporter = nodemailer.createTransport(getTransportOptions());

export const sendOTP = async (to: string, OTP: string) => {
  try {
    const recipient = to.trim().toLowerCase();
    const info = await transporter.sendMail({
      from: `"Connectly" <${mailFrom}>`,
      to: recipient,
      subject: "Your Connectly verification code",
      text: `Your Connectly verification code is ${OTP}. It is valid for 10 minutes. Do not share it with anyone.`,
      html: `
        <div style="margin:0;background:#f6f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#172033;">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:28px;">
            <div style="font-size:22px;font-weight:800;color:#4f46e5;margin-bottom:18px;">Connectly</div>
            <h2 style="margin:0 0 12px;font-size:22px;color:#111827;">Verify your email</h2>
            <p style="margin:0 0 18px;line-height:1.6;color:#475569;">Use this one-time password to continue. It expires in 10 minutes.</p>
            <div style="display:inline-block;background:#eef2ff;color:#3730a3;border-radius:14px;padding:14px 18px;font-size:30px;font-weight:800;letter-spacing:6px;">${OTP}</div>
            <p style="margin:22px 0 0;line-height:1.6;color:#64748b;font-size:14px;">If you did not request this code, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });
    console.log("OTP mail sent:", { messageId: info.messageId, to: recipient });
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw error;
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
