import axios from "axios";
import { cookie } from "../utils/cookie";

// Create a new axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.example.com",
  withCredentials: true, // allow cookies to be sent with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token automatically
axiosClient.interceptors.request.use(
  (config) => {
    const token = cookie.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      cookie.remove("token");
      // optionally: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
