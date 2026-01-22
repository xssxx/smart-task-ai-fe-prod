import axios from "axios";
import { AUTH_COOKIE, ROUTES } from "@/constants";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to set token in cookie
export const setTokenToCookie = (token: string): void => {
  if (typeof window !== "undefined") {
    document.cookie = `${AUTH_COOKIE.NAME}=${token}; path=${AUTH_COOKIE.PATH}; max-age=${AUTH_COOKIE.MAX_AGE}`;
  }
};

// Helper function to get token from cookie
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

// Helper function to clear auth cookie
export const clearAuthCookie = (): void => {
  if (typeof window !== "undefined") {
    document.cookie = `${AUTH_COOKIE.NAME}=; path=${AUTH_COOKIE.PATH}; max-age=0`;
  }
};

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookie
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

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 Unauthorized
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
