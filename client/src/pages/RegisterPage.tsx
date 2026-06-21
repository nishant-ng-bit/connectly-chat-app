import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, checkUsername } from "../api/auth.api";
import axios from "axios";
import { toast } from "react-toastify";
import OTP from "../components/OTP";
import { useAuth } from "../providers/AuthProvider";

const RegisterPage = () => {
  const { setUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    username?: string;
    email?: string;
  }>({});

  const [otp, setOtp] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Debounced real-time username checker
  useEffect(() => {
    const username = formData.username?.trim();
    if (!username) {
      setIsAvailable(null);
      setUsernameError("");
      return;
    }

    if (username.length < 3) {
      setIsAvailable(false);
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    const regex = /^[a-zA-Z0-9_.]+$/;
    if (!regex.test(username)) {
      setIsAvailable(false);
      setUsernameError("Only letters, numbers, underscores, and periods allowed");
      return;
    }

    setUsernameError("");
    setIsChecking(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const { available } = await checkUsername(username);
        setIsAvailable(available);
        if (!available) {
          setUsernameError("Username is already taken");
        }
      } catch (err) {
        console.error(err);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [formData.username]);

  const updateData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, email } = formData;

    if (!username?.trim() || !email?.trim() || !otp.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if (isAvailable === false || usernameError) {
      toast.error(usernameError || "Please choose a different username");
      return;
    }

    try {
      const res = await registerUser({
        username: username.trim(),
        email: email.trim(),
        otp: otp.trim(),
      });

      setUser(res.data);
      toast.success("Account created successfully");
      navigate("/", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Registration failed");
      }
      console.error(error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <form
        onSubmit={submitHandler}
        className="
          w-full max-w-md
          bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl
          border border-slate-200/80 dark:border-slate-800/80
          rounded-3xl shadow-xl
          p-8 flex flex-col gap-5 relative z-10
        "
      >
        <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create an account ✨
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Join and start chatting instantly
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="your_username"
              onChange={updateData}
              className={`
                w-full
                bg-slate-100/50 dark:bg-slate-900/50
                text-slate-900 dark:text-gray-100
                px-4 py-3 rounded-xl border outline-none
                placeholder-slate-400 dark:placeholder-slate-500
                focus:ring-2 focus:ring-indigo-500/10
                transition-all duration-200 font-medium
                ${
                  isAvailable === true
                    ? "border-emerald-500 focus:border-emerald-500"
                    : isAvailable === false
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200/50 dark:border-slate-800 focus:border-indigo-500/50"
                }
              `}
            />
            {/* Inline Status Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {isChecking && (
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              )}
              {!isChecking && isAvailable === true && (
                <span className="text-emerald-500 font-bold text-sm">✓</span>
              )}
              {!isChecking && isAvailable === false && (
                <span className="text-rose-500 font-bold text-sm">✗</span>
              )}
            </div>
          </div>
          {/* Helper error / availability messages */}
          {usernameError && (
            <span className="text-rose-500 text-xs font-semibold px-1 mt-0.5">
              {usernameError}
            </span>
          )}
          {!isChecking && isAvailable === true && (
            <span className="text-emerald-550 dark:text-emerald-400 text-xs font-semibold px-1 mt-0.5">
              Username is available
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            onChange={updateData}
            className="
              bg-slate-100/50 dark:bg-slate-900/50
              text-slate-900 dark:text-gray-100
              px-4 py-3 rounded-xl
              border border-slate-200/50 dark:border-slate-800
              outline-none
              placeholder-slate-400 dark:placeholder-slate-500
              focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10
              transition-all duration-200 font-medium
            "
          />
        </div>

        <OTP setOtp={setOtp} email={formData.email?.trim()} />

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
          Register
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
              const { guestLogin: guestLoginFn } = await import("../api/auth.api");
              const res = await guestLoginFn();
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

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="
              text-indigo-600 dark:text-indigo-400
              hover:text-indigo-500 dark:hover:text-indigo-300
              font-semibold transition-colors duration-200
            "
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
