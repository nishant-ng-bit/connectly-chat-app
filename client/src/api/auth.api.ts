import axiosInstance from "./axios.api";

interface user {
  username?: string;
  email: string;
  otp: string;
}
export const registerUser = async (data: user) => {
  return await axiosInstance.post("/auth/register", data);
};

export const loginUser = async (data: user) => {
  return await axiosInstance.post("/auth/login", data);
};

export const logoutUser = async () => {
  return await axiosInstance.post("/auth/logout");
};

export const getMe = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res;
};
