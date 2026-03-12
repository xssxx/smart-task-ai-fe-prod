import { Task as ApiTask } from "@/services/api";

const STATUS_ALIASES: Record<string, string> = {
  "todo": "todo",
  "to do": "todo",
  "in_progress": "in_progress",
  "inprogress": "in_progress",
  "in-progress": "in_progress",
  "in_review": "in_review",
  "in-review": "in_review",
  "done": "done",
  "completed": "done",
};

const PRIORITY_KEYS: Record<string, string> = {
  "high": "priority.high",
  "medium": "priority.medium",
  "low": "priority.low",
  "urgent": "priority.urgent",
};

const STATUS_KEYS: Record<string, string> = {
  "todo": "status.todo",
  "in_progress": "status.inProgress",
  "in-progress": "status.inProgress",
  "in_review": "status.inReview",
  "in-review": "status.inReview",
  "done": "status.done",
  "completed": "status.done",
};

export function mapApiStatus(status: ApiTask["status"] | string): string {
  if (typeof status !== "string") return "todo";
  return STATUS_ALIASES[status.toLowerCase()] || "todo";
}

export function mapColumnToApiStatus(columnId: string): string {
  return STATUS_ALIASES[columnId] || "todo";
}

export function getPriorityKey(priority: string): string {
  return PRIORITY_KEYS[priority.toLowerCase()] || "priority.medium";
}

export function getStatusKey(status: string): string {
  return STATUS_KEYS[status.toLowerCase()] || "status.todo";
}
