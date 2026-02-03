import axios from "axios";
import { cookie } from "../utils/cookie";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = cookie.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      cookie.remove("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
