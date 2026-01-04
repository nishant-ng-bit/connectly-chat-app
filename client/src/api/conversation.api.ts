import axiosInstance from "./axios.api";

export const getConversations = async () => {
  return await axiosInstance.get("/conversations");
};
