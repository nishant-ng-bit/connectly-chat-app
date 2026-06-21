import axiosInstance from "./axios.api";

export const getMessages = async (data: {
  currentUserId?: string;
  otherUserId?: string;
  conversationId?: string;
}) => {
  return await axiosInstance.post("/msg/get", data);
};

export const sendMessage = async (data: {
  senderId?: string;
  receiverId?: string;
  conversationId?: string;
  content: string;
}) => {
  return await axiosInstance.post("/msg/send", data);
};

export const reactToMessage = async (messageId: string, emoji: string) => {
  return await axiosInstance.post(`/msg/${messageId}/react`, { emoji });
};

export const deleteMsgForUser = async (data: {
  messageId: string;
  userId?: string;
}) => {
  return await axiosInstance.post("/msg/delete", data);
};


export const refineMessageText = async (text: string) => {
  return await axiosInstance.post("/msg/refine", { text });
};
