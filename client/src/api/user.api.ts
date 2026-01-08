import axiosInstance from "./axios.api";

export const getUserByQuery = async (username: string) => {
  return await axiosInstance.get(`/users/search?username=${username}`);
};

export const setProfilePic = async (userId: string, profilePic: File) => {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("profilePic", profilePic);

  return await axiosInstance.post(`/user/profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getUserById = async (userId: string) => {
  return await axiosInstance.get(`/user/${userId}`);
};
