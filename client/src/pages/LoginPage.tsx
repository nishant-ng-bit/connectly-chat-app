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
  const [guestLoading, setGuestLoading] = useState(false);

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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(199,210,254,0.75),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(186,230,253,0.55),transparent_28rem),linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_16%_14%,rgba(79,70,229,0.22),transparent_30rem),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.12),transparent_28rem),linear-gradient(180deg,#020617_0%,#0f172a_62%,#111827_100%)]" />
      <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-[0.18] dark:opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.22) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <Link to="/" className="mb-10 inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">C</span>
            <span>Connectly</span>
          </Link>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-300">Private chats, media, groups</p>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">Jump back into your conversations.</h1>
            <p className="mt-5 max-w-lg text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">OTP login keeps access simple, guest mode lets you try Connectly instantly, and every browser now receives its own private guest space.</p>
          </div>

          <div className="mt-10 max-w-xl rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/25">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold">Live chat preview</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Two people typing in real time</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">Online</span>
            </div>
            <div className="space-y-3">
              <div className="mr-16 rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">Hey, are you joining the group call?</div>
              <div className="ml-16 rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">Yes, sending the notes first.</div>
              <div className="mr-24 inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-900">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-2xl shadow-slate-200/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 dark:shadow-black/30 sm:p-8">
          <Link to="/" className="mb-7 flex items-center justify-center gap-3 text-xl font-extrabold tracking-tight lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">C</span>
            <span>Connectly</span>
          </Link>

          <div className="mb-7 text-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Login with email OTP or continue as a private guest.</p>
          </div>

          <form onSubmit={submitHandler} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Email address</label>
              <input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500" />
            </div>

            <OTP setOtp={setOtp} email={email} />

            <button type="submit" className="rounded-2xl bg-indigo-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 active:bg-indigo-700">Login</button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-bold uppercase text-slate-400">Or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <button type="button" disabled={guestLoading} onClick={guestHandler} className="rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:bg-slate-900">
              {guestLoading ? "Creating guest space..." : "Continue as Guest"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            New here? <Link to="/register" className="font-extrabold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
