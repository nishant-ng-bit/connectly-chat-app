import axiosInstance from "./axios.api";

export const requestOtp = async (data: { email: string }) => {
  return await axiosInstance.post("/auth/request-otp", data);
};
