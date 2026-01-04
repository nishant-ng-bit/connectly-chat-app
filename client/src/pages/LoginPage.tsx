import { useState } from "react";
import { Link } from "react-router-dom";
import OTP from "../components/OTP";
import { loginUser } from "../api/auth.api";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const submitHandlder = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!email?.trim() || !otp?.trim()) return;
      await loginUser({ email: email.trim(), otp: otp.trim() });
      window.location.href = "/chats";
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-amber-700 flex items-center justify-center">
      <div className="bg-amber-100 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center text-amber-900">Login</h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-medium text-amber-900">
            Email
          </label>
          <input
            className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            type="email"
            placeholder="Enter email"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <OTP setOtp={setOtp} email={email} />

        <button
          type="submit"
          onClick={submitHandlder}
          className="mt-4 bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition"
        >
          Login
        </button>
        <p className="text-center text-sm text-amber-900">
          New user?{" "}
          <Link
            to="/register"
            className="font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-4 transition"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
