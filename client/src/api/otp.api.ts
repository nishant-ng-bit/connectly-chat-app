import axiosInstance from "./axios.api";

export const sendOtpHandler = async (data: { email: string }) => {
  return await axiosInstance.post("/auth/request-otp", data);
};
