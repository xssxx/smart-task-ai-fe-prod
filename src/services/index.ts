import axios from "axios";
import { AUTH_COOKIE, ROUTES } from "@/constants";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setTokenToCookie = (token: string): void => {
  if (typeof window !== "undefined") {
    document.cookie = `${AUTH_COOKIE.NAME}=${token}; path=${AUTH_COOKIE.PATH}; max-age=${AUTH_COOKIE.MAX_AGE}`;
  }
};

export const getTokenFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === AUTH_COOKIE.NAME) {
      return value;
    }
  }
  return null;
};

export const clearAuthCookie = (): void => {
  if (typeof window !== "undefined") {
    document.cookie = `${AUTH_COOKIE.NAME}=; path=${AUTH_COOKIE.PATH}; max-age=0`;
  }
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearAuthCookie();
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
