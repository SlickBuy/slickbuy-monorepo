import axios from "axios";

export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("auction_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("auction_token");
      } catch {}
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
