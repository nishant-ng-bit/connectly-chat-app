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

  //  Prevent logged-in users from seeing login page
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
    } catch (error) {
      toast.error("Invalid OTP or email");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            Welcome back 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Login to continue chatting
          </p>
        </div>

        <form onSubmit={submitHandler} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                bg-slate-800 text-gray-100
                px-4 py-2.5 rounded-lg
                border border-slate-700
                outline-none
                placeholder-gray-500
                focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500
                transition
              "
            />
          </div>

          {/* OTP */}
          <OTP setOtp={setOtp} email={email} />

          {/* Submit */}
          <button
            type="submit"
            className="
              mt-2 bg-indigo-600 hover:bg-indigo-700
              text-white font-medium
              py-2.5 rounded-lg
              transition
            "
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          New here?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
