// Chat API Types

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SendMessageRequest {
  content: string;
  session_history?: Message[];
}

export interface TaskAction {
  type: "created" | "updated" | "deleted";
  task_id: string;
  name: string;
}

// LLM Message structure from API
export interface LLMMessageData {
  type: "task_list" | "text";
  meta?: string;
  tasks?: Array<{
    name: string;
    priority: "high" | "medium" | "low";
    status: "todo" | "in_progress" | "done";
    description: string;
    start_datetime: string;
    end_datetime: string;
  }>;
}

export interface SendMessageResponse {
  message: LLMMessageData;
  task_actions?: TaskAction[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Proposed Task from LLM (before user accepts)
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

// UI-specific types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  taskActions?: TaskAction[];
  proposedTasks?: ProposedTask[];
}
