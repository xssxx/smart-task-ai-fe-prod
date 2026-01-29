import apiClient from "..";

// TypeScript interfaces for Dashboard API

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

// API Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: unknown;
}

// Dashboard API functions

/**
 * Get task statistics grouped by status
 * @returns Promise with task counts for each status (todo, in_progress, in_review, done)
 */
export const getTaskStatistics = () => {
  return apiClient.get<ApiResponse<TaskStatistics>>("/api/dashboard/statistics");
};

/**
 * Get unscheduled tasks (tasks with no start_datetime and end_datetime)
 * @returns Promise with list of unscheduled tasks including project information
 */
export const getUnscheduledTasks = () => {
  return apiClient.get<ApiResponse<UnscheduledTasksResponse>>("/api/dashboard/unscheduled-tasks");
};

/**
 * Get today's tasks (tasks scheduled for today)
 * @returns Promise with list of today's tasks including project information
 */
export const getTodayTasks = () => {
  return apiClient.get<ApiResponse<TodayTasksResponse>>("/api/dashboard/today-tasks");
};
