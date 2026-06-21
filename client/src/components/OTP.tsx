import { useEffect, useState } from "react";
import { requestOtp } from "../api/otp.api";
import { toast } from "react-toastify";

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
    if (!email?.trim()) {
      toast.error("Please enter your email first to receive OTP");
      return;
    }

    setOtpSent(true);
    setOtpRetryTimeLeft(duration);

    setTimeout(() => {
      setOtpSent(false);
    }, duration * 1000);

    try {
      await requestOtp({ email });
      toast.success("OTP sent to your email!", { autoClose: 3000 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Try again.");
      setOtpSent(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
            bg-slate-100/50 dark:bg-slate-900/50
            text-slate-900 dark:text-gray-150
            px-4 py-3 rounded-xl
            border border-slate-255/10 dark:border-slate-800
            text-center tracking-[0.4em] text-lg font-bold
            placeholder-slate-400 dark:placeholder-slate-655
            outline-none
            focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10
            transition-all duration-200
          "
        />

        <button
          type="button"
          disabled={otpSent}
          onClick={sendOTP}
          className="
            whitespace-nowrap
            px-5 py-3 rounded-xl
            text-xs font-bold uppercase tracking-wider
            text-white
            bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
            shadow-md shadow-indigo-500/5 hover:shadow-indigo-500/15
            transition-all duration-200
            disabled:bg-slate-100 dark:disabled:bg-slate-900
            disabled:text-slate-400 dark:disabled:text-slate-600
            disabled:border disabled:border-slate-200 dark:disabled:border-slate-800/80
            disabled:shadow-none
            disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          {otpSent ? "OTP Sent" : "Get OTP"}
        </button>
      </div>

      {otpSent && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left font-medium mt-1">
          Didn’t receive OTP?{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            Retry in {otpRetryTimeLeft}s
          </span>
        </p>
      )}
    </div>
  );
};

export default OTP;
