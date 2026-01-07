import axiosInstance from "./axios.api";

export const getMessages = async (data: {
  currentUserId: string;
  otherUserId: string;
}) => {
  return await axiosInstance.post("/msg/get", data);
};

export const sendMessage = async (data: {
  senderId: string;
  receiverId: string;
  content: string;
}) => {
  return await axiosInstance.post("/msg/send", data);
};

export const deleteMsgForUser = async (data: {
  messageId: string;
  userId: string;
}) => {
  return await axiosInstance.post("/msg/delete", data);
};
