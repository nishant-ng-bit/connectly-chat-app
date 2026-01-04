import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import axios from "axios";
import { toast } from "react-toastify";
import OTP from "../components/OTP";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    username?: string;
    email?: string;
    otp?: string;
  }>({});

  const [otp, setOtp] = useState("");

  const updateData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandlder = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      const { username, email } = formData;

      if (!username?.trim() || !email?.trim() || !otp?.trim()) return;

      await registerUser({
        username: username.trim(),
        email: email.trim(),
        otp: otp.trim(),
      });

      toast("User register successfully", { type: "success" });
      navigate("/chats");
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }

      const data = error.response?.data?.error;
      toast(data, { type: "error" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-amber-700 flex items-center justify-center">
      <form
        onSubmit={submitHandlder}
        className="bg-amber-100 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center text-amber-900">
          Register
        </h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="font-medium text-amber-900">
            Username
          </label>
          <input
            className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            type="text"
            name="username"
            id="username"
            placeholder="Enter username"
            onChange={updateData}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-medium text-amber-900">
            Email
          </label>
          <input
            className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            type="email"
            name="email"
            id="email"
            placeholder="Enter email"
            onChange={updateData}
          />
        </div>

        {/*  */}
        <OTP setOtp={setOtp} email={formData.email?.trim()} />

        <button
          type="submit"
          className="mt-4 bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition"
        >
          Register
        </button>
        <p className="text-center text-sm text-amber-900">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-4 transition"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
