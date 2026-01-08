import axiosInstance from "../api/axios.api";
export const uploadMsgFileToCloudinary = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post(`/msg/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw new Error("Cloudinary upload failed");
  }
};
