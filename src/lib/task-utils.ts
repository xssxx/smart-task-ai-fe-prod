import { Task as ApiTask } from "@/services/api";

/**
 * Map API status to internal status format
 */
export function mapApiStatus(status: ApiTask["status"] | string): string {
  if (typeof status === "string") {
    const s = status.toLowerCase();
    if (s === "todo" || s === "to do") return "todo";
    if (s === "in_progress" || s === "inprogress" || s === "in-progress")
      return "in_progress";
    if (s === "in_review" || s === "in-review") return "in_review";
    if (s === "done" || s === "completed") return "done";
  }
  return "todo";
}

/**
 * Map column ID to API status format
 */
export function mapColumnToApiStatus(columnId: string): string {
  const statusMap: Record<string, string> = {
    "todo": "todo",
    "in_progress": "in_progress",
    "in_review": "in_review",
    "done": "done",
  };
  return statusMap[columnId] || "todo";
}

/**
 * Get priority label in Thai
 */
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    "high": "สูง",
    "medium": "ปานกลาง",
    "low": "ต่ำ",
    "urgent": "ด่วนมาก",
  };
  return labels[priority.toLowerCase()] || priority;
}

/**
 * Get status label in Thai
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    "todo": "รอดำเนินการ",
    "in_progress": "กำลังดำเนินการ",
    "in-progress": "กำลังดำเนินการ",
    "in_review": "รอตรวจสอบ",
    "in-review": "รอตรวจสอบ",
    "done": "เสร็จสิ้น",
    "completed": "เสร็จสิ้น",
  };
  return labels[status.toLowerCase()] || status;
}
