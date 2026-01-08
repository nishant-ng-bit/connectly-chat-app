import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gray-50 dark:bg-slate-950
        transition-colors
      "
    >
      <form
        onSubmit={submitHandler}
        className="
          w-full max-w-md
          bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-800
          rounded-2xl shadow-xl
          p-8 flex flex-col gap-4
        "
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
            Create an account ✨
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
            Join and start chatting instantly
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="username"
            placeholder="your_username"
            onChange={updateData}
            className="
              bg-gray-100 dark:bg-slate-800
              text-slate-900 dark:text-gray-100
              px-4 py-2.5 rounded-lg
              border border-gray-300 dark:border-slate-700
              outline-none
              placeholder-slate-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500
              transition
            "
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            onChange={updateData}
            className="
              bg-gray-100 dark:bg-slate-800
              text-slate-900 dark:text-gray-100
              px-4 py-2.5 rounded-lg
              border border-gray-300 dark:border-slate-700
              outline-none
              placeholder-slate-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-indigo-500
              focus:border-indigo-500
              transition
            "
          />
        </div>

        <OTP setOtp={setOtp} email={formData.email?.trim()} />

        <button
          type="submit"
          className="
            mt-2
            bg-indigo-600 hover:bg-indigo-700
            text-white font-medium
            py-2.5 rounded-lg
            transition
          "
        >
          Register
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="
              text-indigo-600 dark:text-indigo-400
              hover:text-indigo-500 dark:hover:text-indigo-300
              font-medium transition
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
