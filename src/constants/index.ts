// Task Priority Options
export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

// Task Status Options
export const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
] as const;

// Toast Duration (in milliseconds)
export const TOAST_DURATION = {
  SUCCESS: 2000,
  ERROR: 3000,
} as const;

// Auth Cookie Settings
export const AUTH_COOKIE = {
  NAME: "auth-token",
  MAX_AGE: 86400, // 24 hours in seconds
  PATH: "/",
} as const;

// Routes
export const ROUTES = {
  HOME: "/app/home",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  CALLBACK: "/auth/callback",
} as const;

// Workspace Colors for Sidebar
export const WORKSPACE_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
] as const;

// Priority Colors
export const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Status Colors
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    case "in-progress":
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "review":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "todo":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Action Badge Colors (for chat)
export const getActionBadgeColor = (type: string): string => {
  switch (type) {
    case "created":
      return "bg-green-100 text-green-800 border-green-200";
    case "updated":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "deleted":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
