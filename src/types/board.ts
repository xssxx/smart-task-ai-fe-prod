export interface DraggedTask {
  task: Task;
  sourceColumnId: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  assignees: string[];
  dueDate: string;
  comments: number;
  attachments: number;
  tags: string[];
}

// Shared utility for priority colors
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
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

// Shared utility for status colors
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "todo":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
