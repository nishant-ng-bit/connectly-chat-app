import { useEffect, useState } from "react";
import { sendOtpHandler } from "../api/otp.api";
import React from "react";

type OtpProps = {
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  email?: string;
};

const OTP = ({ setOtp, email }: OtpProps) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpRetryTimeLeft, setOtpRetryTimeLeft] = useState(0);

  useEffect(() => {
    if (!otpSent) {
      return;
    }

    const interval = setInterval(() => {
      setOtpRetryTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent]);

  const duration = 120;
  const sendOTP = async () => {
    if (!email) return;

    setOtpSent(true);
    setOtpRetryTimeLeft(duration);
    setTimeout(() => {
      setOtpSent(false);
    }, duration * 1000);

    await sendOtpHandler({ email });
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="font-medium text-amber-900">OTP</div>
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
        <input
          className="border-2 rounded-lg px-4 py-3 text-center tracking-wider text-lg font-semibold
             focus:outline-none focus:ring-2 focus:ring-amber-500"
          type="text"
          name="otp"
          id="otp"
          placeholder="Enter OTP"
          maxLength={6}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          type="button"
          disabled={otpSent}
          onClick={() => sendOTP()}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Get OTP
        </button>
      </div>
      {otpSent && (
        <p className="text-sm text-center text-amber-800">
          Didn’t receive OTP?{" "}
          <span className="font-semibold">
            Retry in {otpSent ? otpRetryTimeLeft : "--:--"}
          </span>
        </p>
      )}
    </div>
  );
};

export default OTP;
