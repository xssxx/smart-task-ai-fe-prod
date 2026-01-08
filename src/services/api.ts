import apiClient from ".";
import { SigninRequest } from "@/types/auth/signin";
import { SignupRequest } from "@/types/auth/signup";
import { SendMessageRequest, SendMessageResponse, ApiResponse } from "@/types/chat";

export const signup = (payload: SignupRequest) => {
  return apiClient.post("/api/signup", payload);
};

export const signin = (payload: SigninRequest) => {
  return apiClient.post("/api/login", payload);
};

// Project types
export interface ProjectConfig {
  nickname?: string;
  context?: string;
  domain_knowledge?: string;
}

export interface Project {
  id: string;
  name: string;
  config?: ProjectConfig;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ListProjectsResponse {
  items: Project[];
  pagination: Pagination;
}

// Project API
export const listProjects = (limit = 10, offset = 0) => {
  return apiClient.get<{ success: boolean; message: string; data: ListProjectsResponse; error: unknown }>(`/api/projects?limit=${limit}&offset=${offset}`);
};

// Chat API
export const sendChatMessage = (
  projectId: string,
  payload: SendMessageRequest
) => {
  return apiClient.post<ApiResponse<SendMessageResponse>>(
    `/api/${projectId}/chat`,
    payload
  );
};

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

// Streaming chat (returns EventSource-like handling)
export const sendChatMessageStream = (
  projectId: string,
  payload: SendMessageRequest,
  onMessage: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) => {
  const token = getTokenFromCookie();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  // Use fetch for SSE with POST request
  fetch(`${baseUrl}/api/${projectId}/chat?stream=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onDone();
              return;
            }
            onMessage(data);
          } else if (line.startsWith("event: error")) {
            // Next line will be the error data
          } else if (line.startsWith("event: done")) {
            // Next line will be [DONE]
          }
        }
      }
      onDone();
    })
    .catch((error) => {
      onError(error.message || "Failed to connect to chat service");
    });
};
