export { getPriorityColor, getStatusColor } from "@/constants";

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
