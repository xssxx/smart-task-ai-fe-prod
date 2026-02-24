// Task Priority Options
export const PRIORITY_OPTIONS = [
  { value: "low", label: "ต่ำ" },
  { value: "medium", label: "ปานกลาง" },
  { value: "high", label: "สูง" },
  { value: "urgent", label: "ด่วนมาก" },
] as const;

// Task Status Options
export const STATUS_OPTIONS = [
  { value: "todo", label: "รอดำเนินการ" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "in_review", label: "รอตรวจสอบ" },
  { value: "done", label: "เสร็จสิ้น" },
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
  PROFILE_SETUP: "/auth/profile-setup",
  PROFILE: "/app/profile",
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
      return "priority-badge-urgent";
    case "high":
      return "priority-badge-high";
    case "medium":
      return "priority-badge-medium";
    case "low":
      return "priority-badge-low";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Status Colors
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status?.toLowerCase().replace("-", "_");
  switch (normalizedStatus) {
    case "completed":
    case "done":
      return "status-badge-done";
    case "in_progress":
      return "status-badge-in-progress";
    case "in_review":
      return "status-badge-in-review";
    case "todo":
      return "status-badge-todo";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Action Badge Colors
export const getActionBadgeColor = (type: string): string => {
  switch (type) {
    case "created":
      return "action-badge-created";
    case "updated":
      return "action-badge-updated";
    case "deleted":
      return "action-badge-deleted";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Completion Rate Color
export const getCompletionRateColor = (rate: number): string => {
  if (rate > 0) {
    return "var(--completion-positive)";
  } else if (rate === 0) {
    return "var(--completion-neutral)";
  } else {
    return "var(--completion-negative)";
  }
};
