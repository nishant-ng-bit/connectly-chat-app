import axiosInstance from "./axios.api";

interface user {
  username?: string;
  email: string;
  otp: string;
}
export const registerUser = async (data: user) => {
  const res = await axiosInstance.post("/auth/register", data);
  return res;
};

export const loginUser = async (data: user) => {
  const res = await axiosInstance.post("/auth/login", data);
  return res;
};

export const logoutUser = async () => {
  return await axiosInstance.post("/auth/logout");
};

export const getMe = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res;
};
