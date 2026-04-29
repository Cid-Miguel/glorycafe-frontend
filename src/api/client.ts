import axios from "axios";
import { getAccessToken, useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = error.config?.url ?? "";
      if (path.includes("/api/admin/")) {
        useAuthStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);
