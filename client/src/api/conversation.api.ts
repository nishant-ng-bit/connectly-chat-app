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

export const createGroupConversation = async (data: {
  name: string;
  memberIds: string[];
}) => {
  return await axiosInstance.post("/conversations/groups", data);
};

export const renameGroupConversation = async (conversationId: string, name: string) => {
  return await axiosInstance.patch(`/conversations/${conversationId}/groups`, { name });
};

export const addGroupMembers = async (conversationId: string, memberIds: string[]) => {
  return await axiosInstance.post(`/conversations/${conversationId}/participants`, { memberIds });
};

export const removeGroupMember = async (conversationId: string, memberId: string) => {
  return await axiosInstance.delete(`/conversations/${conversationId}/participants/${memberId}`);
};

export const clearConversation = async (conversationId: string) => {
  return await axiosInstance.post(`/conversations/${conversationId}/clear`);
};
