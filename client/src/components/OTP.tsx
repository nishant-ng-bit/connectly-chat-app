import { useEffect, useState } from "react";
import { sendOtpHandler } from "../api/otp.api";

type OtpProps = {
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  email?: string;
};

const OTP = ({ setOtp, email }: OtpProps) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpRetryTimeLeft, setOtpRetryTimeLeft] = useState(0);

  useEffect(() => {
    if (!otpSent) return;

    const interval = setInterval(() => {
      setOtpRetryTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent]);

  const duration = 120;

  const sendOTP = async () => {
    if (!email?.trim()) return;

    setOtpSent(true);
    setOtpRetryTimeLeft(duration);

    setTimeout(() => {
      setOtpSent(false);
    }, duration * 1000);

    await sendOtpHandler({ email });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        One-Time Password
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          maxLength={6}
          placeholder="••••••"
          onChange={(e) => setOtp(e.target.value)}
          className="
            flex-1
            bg-slate-100 text-black
            dark:bg-slate-800 dark:text-gray-100
            px-4 py-3 rounded-xl
            border border-slate-400
            dark:border-slate-700
            text-center tracking-[0.4em] text-lg font-semibold
            placeholder-gray-500
            outline-none
            focus:ring-2 focus:ring-indigo-500
            focus:border-indigo-500
            transition
          "
        />

        <button
          type="button"
          disabled={otpSent}
          onClick={sendOTP}
          className="
            whitespace-nowrap
            px-4 py-3 rounded-xl
            text-sm font-medium
            text-white
            bg-indigo-600 hover:bg-indigo-700
            transition
            disabled:bg-slate-700
            disabled:text-gray-400
            disabled:cursor-not-allowed
          "
        >
          {otpSent ? "OTP Sent" : "Get OTP"}
        </button>
      </div>

      {otpSent && (
        <p className="text-xs text-gray-400 text-center sm:text-left">
          Didn’t receive OTP?{" "}
          <span className="text-indigo-400 font-medium">
            Retry in {otpRetryTimeLeft}s
          </span>
        </p>
      )}
    </div>
  );
};

export default OTP;
