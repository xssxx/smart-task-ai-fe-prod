import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get token from cookie
const getTokenFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth-token") {
      return value;
    }
  }
  return null;
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
        document.cookie = "auth-token=; path=/; max-age=0";
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
