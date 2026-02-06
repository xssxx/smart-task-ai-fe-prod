import apiClient, { clearAuthCookie } from ".";
import { SigninRequest } from "@/types/auth/signin";
import { SignupRequest } from "@/types/auth/signup";
import { SendMessageRequest, SendMessageResponse, ApiResponse } from "@/types/chat";
import { CreateProfileRequest, CreateProfileResponse } from "@/types/profile";
import { ROUTES } from "@/constants";

export const signup = (payload: SignupRequest) => {
  return apiClient.post("/api/signup", payload);
};

// Profile API
export const createProfile = (payload: CreateProfileRequest) => {
  return apiClient.post<{ success: boolean; message: string; data: CreateProfileResponse; error: unknown }>("/api/profiles", payload);
};

export const getProfile = () => {
  return apiClient.get<{ success: boolean; message: string; data: { account_id: string; first_name: string; last_name: string; nickname?: string; avatar_path?: string; state: string; created_at: string; updated_at: string }; error: unknown }>("/api/profiles");
};

export const updateProfile = (payload: { first_name: string; last_name: string; nickname?: string; avatar_path?: string }) => {
  return apiClient.patch<{ success: boolean; message: string; data: { account_id: string; first_name: string; last_name: string; nickname?: string; avatar_path?: string; state: string; created_at: string; updated_at: string }; error: unknown }>("/api/profiles", payload);
};

// Dashboard types
export interface TaskStatistics {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
}

export interface TaskWithProject {
  id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_datetime?: string;
  end_datetime?: string;
  project: {
    id: string;
    name: string;
  };
}

export interface UnscheduledTasksResponse {
  items: TaskWithProject[];
  total: number;
}

export interface TodayTasksResponse {
  items: TaskWithProject[];
  total: number;
}

// Dashboard API
export const getTaskStatistics = () => {
  return apiClient.get<{ success: boolean; message: string; data: TaskStatistics; error: unknown }>("/api/dashboard/statistics");
};

export const getUnscheduledTasks = () => {
  return apiClient.get<{ success: boolean; message: string; data: UnscheduledTasksResponse; error: unknown }>("/api/dashboard/unscheduled-tasks");
};

export const getTodayTasks = () => {
  return apiClient.get<{ success: boolean; message: string; data: TodayTasksResponse; error: unknown }>("/api/dashboard/today-tasks");
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
  return apiClient.patch<{ success: boolean; message: string; data: Project; error: unknown }>(`/api/projects/${projectId}`, payload);
};

export const deleteProject = (projectId: string) => {
  return apiClient.delete<{ success: boolean; message: string; error: unknown }>(`/api/projects/${projectId}`);
};

// Task types
export interface Task {
  id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  recurring_days?: number;
  recurring_until?: string;
  created_at: string;
  updated_at: string;
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
