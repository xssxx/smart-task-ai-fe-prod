export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SendMessageRequest {
  content: string;
  session_history?: Message[];
  locale?: string;
}

export interface TaskAction {
  type: "created" | "updated" | "deleted";
  task_id: string;
  name: string;
}

export interface SendMessageResponse {
  type: "text" | "task_actions";
  message: string;
  tasks?: BackendTask[];
  task_actions?: TaskAction[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProposedTask {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  description: string;
  start_datetime: string;
  end_datetime: string;
  userAction?: "accepted" | "rejected" | "pending";
}

export interface BackendTask {
  name: string;
  description?: string;
  priority?: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  recurring_days?: number;
  recurring_until?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  taskActions?: TaskAction[];
  proposedTasks?: ProposedTask[];
}
