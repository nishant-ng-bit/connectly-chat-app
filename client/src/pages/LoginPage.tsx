import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import OTP from "../components/OTP";
import { loginUser } from "../api/auth.api";
import { toast } from "react-toastify";
import { useAuth } from "../providers/AuthProvider";

const LoginPage = () => {
  const { setUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      toast.error("Please enter email and OTP");
      return;
    }

    try {
      const res = await loginUser({
        email: email.trim(),
        otp: otp.trim(),
      });

      setUser(res.data);
      toast.success("Logged in successfully");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP or email");
      console.error(error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Enter your details below to log in
          </p>
        </div>

        <form onSubmit={submitHandler} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                bg-slate-100/50 dark:bg-slate-900/50
                text-slate-900 dark:text-gray-100
                px-4 py-3 rounded-xl
                border border-slate-255/10 dark:border-slate-800
                outline-none
                placeholder-slate-400 dark:placeholder-slate-500
                focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10
                transition-all duration-200 font-medium
              "
            />
          </div>

          {/* OTP Section */}
          <OTP setOtp={setOtp} email={email} />

          {/* Submit */}
          <button
            type="submit"
            className="
              mt-2
              bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
              text-white font-semibold
              py-3.5 rounded-xl
              shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20
              transition-all duration-200 cursor-pointer text-center
            "
          >
            Login
          </button>
          
          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Guest Login */}
          <button
            type="button"
            onClick={async () => {
              try {
                const { guestLogin } = await import("../api/auth.api");
                const res = await guestLogin();
                setUser(res.data);
                toast.success("Logged in as Guest");
                navigate("/", { replace: true });
              } catch (error: any) {
                toast.error("Failed to login as guest");
                console.error(error);
              }
            }}
            className="
              bg-white hover:bg-slate-100 active:bg-slate-200
              dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:active:bg-slate-800
              text-slate-700 dark:text-slate-350 font-semibold
              py-3.5 rounded-xl
              border border-slate-200 dark:border-slate-800
              transition-all duration-200 cursor-pointer text-center
            "
          >
            🚀 Fast Entry as Guest
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-650 dark:text-slate-400 mt-8 font-medium">
          New here?{" "}
          <Link
            to="/register"
            className="
              text-indigo-600 dark:text-indigo-400
              hover:text-indigo-550 dark:hover:text-indigo-350
              font-semibold transition-colors duration-200
            "
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
