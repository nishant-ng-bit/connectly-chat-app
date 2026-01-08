import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://connectly-chat-app.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
