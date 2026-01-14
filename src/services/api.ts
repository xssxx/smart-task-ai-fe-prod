import apiClient, { clearAuthCookie } from ".";
import { SigninRequest } from "@/types/auth/signin";
import { SignupRequest } from "@/types/auth/signup";
import { SendMessageRequest, SendMessageResponse, ApiResponse } from "@/types/chat";
import { ROUTES } from "@/constants";

export const signup = (payload: SignupRequest) => {
  return apiClient.post("/api/signup", payload);
};

export const signin = (payload: SigninRequest) => {
  return apiClient.post("/api/login", payload);
};

export const logout = () => {
  clearAuthCookie();
  window.location.href = ROUTES.LOGIN;
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

export interface CreateProjectRequest {
  name: string;
  config?: {
    nickname?: string;
    context?: string;
    domain_knowledge?: string;
  };
}

export interface CreateProjectResponse {
  project_id: string;
}

export const createProject = (payload: CreateProjectRequest) => {
  return apiClient.post<{ success: boolean; message: string; data: CreateProjectResponse; error: unknown }>("/api/projects", payload);
};

export interface UpdateProjectRequest {
  name?: string;
  config?: {
    nickname?: string;
    context?: string;
    domain_knowledge?: string;
  };
}

export const updateProject = (projectId: string, payload: UpdateProjectRequest) => {
  return apiClient.put<{ success: boolean; message: string; data: Project; error: unknown }>(`/api/projects/${projectId}`, payload);
};

export const deleteProject = (projectId: string) => {
  return apiClient.delete<{ success: boolean; message: string; error: unknown }>(`/api/projects/${projectId}`);
};

// Task types
export interface Task {
  id: string;
  nodeId: string;
  projectId: string;
  name: string;
  description: string;
  priority: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  recurringDays: number;
  recurringUntil: string;
  status: {
    Todo: string;
    InProgess: string;
    Review: string;
    Done: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListTasksResponse {
  items: Task[];
  pagination: Pagination;
}

// Task API
export const listTasksByProject = (projectId: string, limit = 10, offset = 0) => {
  return apiClient.get<{ success: boolean; message: string; data: ListTasksResponse; error: unknown }>(
    `/api/${projectId}/tasks?limit=${limit}&offset=${offset}`
  );
};

export const getTaskById = (taskId: string) => {
  return apiClient.get<{ success: boolean; message: string; data: Task; error: unknown }>(`/api/tasks/${taskId}`);
};

export interface CreateTaskRequest {
  name: string;
  description?: string;
  priority?: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  recurring_days?: number;
}

export const createTask = (projectId: string, payload: CreateTaskRequest) => {
  return apiClient.post<{ success: boolean; message: string; data: { task_id: string }; error: unknown }>(
    `/api/${projectId}/tasks`,
    payload
  );
};

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  priority?: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  status?: string;
  recurring_days?: number;
}

export const updateTask = (taskId: string, payload: UpdateTaskRequest) => {
  return apiClient.patch<{ success: boolean; message: string; data: Task; error: unknown }>(
    `/api/tasks/${taskId}`,
    payload
  );
};

export const deleteTask = (taskId: string) => {
  return apiClient.delete<{ success: boolean; message: string; data: { task_id: string }; error: unknown }>(
    `/api/tasks/${taskId}`
  );
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
