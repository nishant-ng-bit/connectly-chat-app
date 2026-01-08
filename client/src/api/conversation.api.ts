import axiosInstance from "./axios.api";

export const getConversations = async () => {
  return await axiosInstance.get("/conversations");
};

export const getConversationId = async ({
  currentUserId,
  otherUserId,
}: {
  currentUserId: string;
  otherUserId: string;
}) => {
  return await axiosInstance.get("/conversation/id", {
    params: { currentUserId, otherUserId },
  });
};

export const clearConversation = async (conversationId: string) => {
  return await axiosInstance.post(`/conversations/${conversationId}/clear`);
};
