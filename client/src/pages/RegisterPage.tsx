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

  const [formData, setFormData] = useState<{ username?: string; email?: string }>({});
  const [otp, setOtp] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    }, 400);

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

  const guestHandler = async () => {
    try {
      setGuestLoading(true);
      const { guestLogin } = await import("../api/auth.api");
      const res = await guestLogin();
      setUser(res.data);
      toast.success("Logged in as Guest");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to login as guest");
      console.error(error);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen min-h-dvh overflow-hidden bg-[#f7f8fb] px-4 py-8 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(199,210,254,0.75),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(187,247,208,0.55),transparent_28rem),linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_16%_14%,rgba(79,70,229,0.22),transparent_30rem),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.12),transparent_28rem),linear-gradient(180deg,#020617_0%,#0f172a_62%,#111827_100%)]" />
      <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-[0.18] dark:opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.22) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-2xl shadow-slate-200/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 dark:shadow-black/30 sm:p-8">
          <Link to="/" className="mb-7 flex items-center justify-center gap-3 text-xl font-extrabold tracking-tight lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">C</span>
            <span>Connectly</span>
          </Link>

          <div className="mb-7 text-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Pick a username, verify OTP, and start chatting.</p>
          </div>

          <form onSubmit={submitHandler} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Username</label>
              <div className="relative">
                <input type="text" name="username" placeholder="your_username" onChange={updateData} className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 pr-12 font-semibold text-slate-950 outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 ${isAvailable === true ? "border-emerald-400 focus:border-emerald-400" : isAvailable === false ? "border-rose-400 focus:border-rose-400" : "border-slate-200 focus:border-indigo-400 dark:border-slate-800"}`} />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isChecking && <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />}
                  {!isChecking && isAvailable === true && <span className="text-sm font-black text-emerald-500">✓</span>}
                  {!isChecking && isAvailable === false && <span className="text-sm font-black text-rose-500">×</span>}
                </div>
              </div>
              {usernameError && <span className="px-1 text-xs font-bold text-rose-500">{usernameError}</span>}
              {!isChecking && isAvailable === true && <span className="px-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">Username is available</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Email address</label>
              <input type="email" name="email" placeholder="name@example.com" onChange={updateData} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500" />
            </div>

            <OTP setOtp={setOtp} email={formData.email?.trim()} />

            <button type="submit" className="rounded-2xl bg-indigo-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 active:bg-indigo-700">Create account</button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-bold uppercase text-slate-400">Or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <button type="button" disabled={guestLoading} onClick={guestHandler} className="rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900">
              {guestLoading ? "Creating guest space..." : "Try as private Guest"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Already have an account? <Link to="/login" className="font-extrabold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300">Login</Link>
          </p>
        </div>

        <div className="hidden lg:block">
          <Link to="/" className="mb-10 inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">C</span>
            <span>Connectly</span>
          </Link>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-300">Start clean, stay connected</p>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">Your people, groups, media, and AI in one place.</h1>
            <p className="mt-5 max-w-lg text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">Create a real profile for long-term chats, or use guest mode when you just want to explore without sharing an inbox.</p>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
            {[
              ["Private guest", "Unique per browser, not shared globally."],
              ["OTP access", "No password friction for sign in."],
              ["Groups", "Create rooms and manage members."],
              ["AI polish", "Refine drafted messages before sending."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/20">
                <p className="font-extrabold text-slate-950 dark:text-white">{title}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
