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
      return "bg-[#9f0712]/10 text-[#9f0712] border-[#9f0712]/20";
    case "high":
      return "bg-[#ff2056]/10 text-[#ff2056] border-[#ff2056]/20";
    case "medium":
      return "bg-[#fe9a00]/10 text-[#fe9a00] border-[#fe9a00]/20";
    case "low":
      return "bg-[#7ccf00]/10 text-[#7ccf00] border-[#7ccf00]/20";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Status Colors
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "done":
      return "bg-[#7ccf00]/10 text-[#7ccf00] border-[#7ccf00]/20";
    case "in-progress":
    case "in_progress":
      return "bg-[#00a6f4]/10 text-[#00a6f4] border-[#00a6f4]/20";
    case "in-review":
    case "in_review":
      return "bg-[#f0b100]/10 text-[#f0b100] border-[#f0b100]/20";
    case "todo":
      return "bg-[#737373]/10 text-[#737373] border-[#737373]/20";
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
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Completion Rate Color
export const getCompletionRateColor = (rate: number): string => {
  if (rate > 0) {
    return "#7ccf00"; // lime-500 - green
  } else if (rate === 0) {
    return "#212121"; // hard-gray
  } else {
    return "#fb2c36"; // rose-500
  }
};
