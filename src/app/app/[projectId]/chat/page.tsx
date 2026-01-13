"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Send,
  Bot,
  CheckCircle2,
  User,
  Loader2,
  AlertCircle,
  Check,
  Pencil,
  X,
  Calendar,
  Clock,
  Flag,
} from "lucide-react";
import { sendChatMessage, createTask, CreateTaskRequest } from "@/services/api";
import { ChatMessage, Message, ProposedTask } from "@/types/chat";
import { getActionBadgeColor } from "@/constants";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Remove [TEXT][/TEXT] tags from content
function cleanTextTags(content: string): string {
  return content
    .replace(/\[TEXT\]/g, "")
    .replace(/\[\/TEXT\]/g, "")
    .trim();
}

// Parse [TASKS] from LLM response
function parseTasksFromResponse(content: string): {
  text: string;
  tasks: ProposedTask[];
} {
  const tasksMatch = content.match(/\[TASKS\]([\s\S]*?)\[\/TASKS\]/);

  if (!tasksMatch) {
    // No tasks, just clean text tags
    return { text: cleanTextTags(content), tasks: [] };
  }

  const textContent = content
    .replace(/\[TASKS\][\s\S]*?\[\/TASKS\]/, "")
    .trim();

  try {
    const tasksJson = JSON.parse(tasksMatch[1]);
    const tasks: ProposedTask[] = tasksJson.map(
      (task: Omit<ProposedTask, "id" | "userAction">, idx: number) => ({
        ...task,
        id: `proposed-${Date.now()}-${idx}`,
        userAction: "pending" as const,
      })
    );
    // Clean text tags from the text content
    return { text: cleanTextTags(textContent), tasks };
  } catch {
    return { text: cleanTextTags(content), tasks: [] };
  }
}

// Priority badge colors
function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "high":
      return "สูง";
    case "medium":
      return "ปานกลาง";
    case "low":
      return "ต่ำ";
    default:
      return priority;
  }
}

// Format datetime for display
function formatDateTime(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, "d MMM yyyy HH:mm", { locale: th });
  } catch {
    return dateString;
  }
}

// TaskProposalCard Component
interface TaskProposalCardProps {
  task: ProposedTask;
  onAccept: (task: ProposedTask) => void;
  onEdit: (task: ProposedTask) => void;
  onReject: (task: ProposedTask) => void;
}

function TaskProposalCard({
  task,
  onAccept,
  onEdit,
  onReject,
}: TaskProposalCardProps) {
  const isProcessed = task.userAction !== "pending";

  return (
    <Card
      className={`border transition-all ${
        task.userAction === "accepted"
          ? "border-green-300 bg-green-50"
          : task.userAction === "rejected"
          ? "border-red-300 bg-red-50 opacity-60"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                {task.name}
              </h4>
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(task.priority)}`}
              >
                <Flag className="w-3 h-3 mr-1" />
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
              {task.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">{formatDateTime(task.start_datetime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">ถึง {formatDateTime(task.end_datetime)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons or status */}
          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            {isProcessed ? (
              <Badge
                variant="outline"
                className={`text-xs ${
                  task.userAction === "accepted"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }`}
              >
                {task.userAction === "accepted" ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    ยอมรับแล้ว
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    ปฏิเสธแล้ว
                  </>
                )}
              </Badge>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-green-600 border-green-300 hover:bg-green-50 flex-1 sm:flex-none"
                  onClick={() => onAccept(task)}
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Accept</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-blue-600 border-blue-300 hover:bg-blue-50 flex-1 sm:flex-none"
                  onClick={() => onEdit(task)}
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
                  onClick={() => onReject(task)}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reject</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Edit Task Modal Component
interface EditTaskModalProps {
  task: ProposedTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ProposedTask) => void;
}

function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  const [editedTask, setEditedTask] = useState<ProposedTask | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไข Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ Task</Label>
            <Input
              id="name"
              value={editedTask.name}
              onChange={(e) =>
                setEditedTask({ ...editedTask, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>ความสำคัญ</Label>
            <Select
              value={editedTask.priority}
              onValueChange={(value: "high" | "medium" | "low") =>
                setEditedTask({ ...editedTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="low">ต่ำ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>เริ่มต้น</Label>
              <DateTimePicker
                value={{
                  date: new Date(editedTask.start_datetime),
                  hasTime: true,
                }}
                onChange={({ date }) =>
                  setEditedTask({
                    ...editedTask,
                    start_datetime: date.toISOString(),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>สิ้นสุด</Label>
              <DateTimePicker
                value={{
                  date: new Date(editedTask.end_datetime),
                  hasTime: true,
                }}
                onChange={({ date }) =>
                  setEditedTask({
                    ...editedTask,
                    end_datetime: date.toISOString(),
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-1" />
            บันทึกและยอมรับ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// localStorage key for last chat
const getStorageKey = (projectId: string) => `chat_last_${projectId}`;

// Type for stored chat (timestamp as string for JSON)
interface StoredChatMessage extends Omit<ChatMessage, "timestamp"> {
  timestamp: string;
}

export default function AIChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Edit modal state
  const [editingTask, setEditingTask] = useState<ProposedTask | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load last chat from localStorage on mount
  useEffect(() => {
    if (!projectId) return;

    try {
      const stored = localStorage.getItem(getStorageKey(projectId));
      if (stored) {
        const parsed: StoredChatMessage[] = JSON.parse(stored);
        // Convert timestamp string back to Date
        const restored = parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restored);
      }
    } catch (err) {
      console.error("Failed to load chat from localStorage:", err);
    }
  }, [projectId]);

  // Save last chat pair to localStorage when messages change
  useEffect(() => {
    if (!projectId || messages.length === 0) return;

    // Find the last user message and its following assistant response
    const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) return;

    // Get the last conversation pair (user + assistant if exists)
    const lastPair: ChatMessage[] = [messages[lastUserIndex]];
    if (
      lastUserIndex + 1 < messages.length &&
      messages[lastUserIndex + 1].role === "assistant"
    ) {
      lastPair.push(messages[lastUserIndex + 1]);
    }

    // Convert to storable format (timestamp as string)
    const toStore: StoredChatMessage[] = lastPair.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));

    try {
      localStorage.setItem(getStorageKey(projectId), JSON.stringify(toStore));
    } catch (err) {
      console.error("Failed to save chat to localStorage:", err);
    }
  }, [messages, projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSessionHistory = (): Message[] => {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !projectId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const sessionHistory = getSessionHistory();
    await handleNonStreamingResponse(input, sessionHistory);
  };

  const handleNonStreamingResponse = async (
    content: string,
    sessionHistory: Message[]
  ) => {
    try {
      const response = await sendChatMessage(projectId, {
        content,
        session_history: sessionHistory,
      });

      const rawMessage = response.data.data.message;
      const { text, tasks } = parseTasksFromResponse(rawMessage);

      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
        taskActions: response.data.data.task_actions,
        proposedTasks: tasks.length > 0 ? tasks : undefined,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาลองใหม่อีกครั้ง";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update task action in message
  const updateTaskAction = (
    messageId: string,
    taskId: string,
    action: "accepted" | "rejected"
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.proposedTasks) {
          return {
            ...msg,
            proposedTasks: msg.proposedTasks.map((task) =>
              task.id === taskId ? { ...task, userAction: action } : task
            ),
          };
        }
        return msg;
      })
    );
  };

  // Convert ProposedTask to CreateTaskRequest
  const proposedTaskToRequest = (task: ProposedTask): CreateTaskRequest => ({
    name: task.name,
    description: task.description,
    priority: task.priority,
    start_date_time: task.start_datetime,
    end_date_time: task.end_datetime,
    status: task.status,
  });

  // Handle accept task
  const handleAcceptTask = async (messageId: string, task: ProposedTask) => {
    try {
      const payload = proposedTaskToRequest(task);
      await createTask(projectId, payload);
      updateTaskAction(messageId, task.id, "accepted");
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("ไม่สามารถสร้าง task ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Handle edit task
  const handleEditTask = (messageId: string, task: ProposedTask) => {
    setEditingTask(task);
    setEditingMessageId(messageId);
    setIsEditModalOpen(true);
  };

  // Handle save edited task
  const handleSaveEditedTask = async (
    messageId: string,
    editedTask: ProposedTask
  ) => {
    try {
      const payload = proposedTaskToRequest(editedTask);
      await createTask(projectId, payload);
      // Update the task in messages
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.proposedTasks) {
            return {
              ...msg,
              proposedTasks: msg.proposedTasks.map((task) =>
                task.id === editedTask.id
                  ? { ...editedTask, userAction: "accepted" as const }
                  : task
              ),
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("ไม่สามารถสร้าง task ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Handle reject task
  const handleRejectTask = (messageId: string, task: ProposedTask) => {
    updateTaskAction(messageId, task.id, "rejected");
    console.log("Rejected task:", task);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="h-screen flex flex-col max-w-5xl mx-auto">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  AI Task Assistant
                </h2>
                <p className="text-sm text-gray-600">
                  สร้างและจัดการ tasks ด้วย AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div className="shrink-0">
                {message.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div
                className={`flex-1 ${
                  message.role === "user" ? "flex justify-end" : ""
                }`}
              >
                <div
                  className={`inline-block max-w-2xl ${
                    message.role === "user"
                      ? "bg-gray-900 text-white rounded-2xl rounded-tr-sm"
                      : "bg-white border border-gray-200 rounded-2xl rounded-tl-sm"
                  } p-4 shadow-sm`}
                >
                  <p
                    className={`text-sm whitespace-pre-wrap ${
                      message.role === "user" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp?.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) || ""}
                  </p>
                </div>

                {message.taskActions && message.taskActions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {message.taskActions.map((action, idx) => (
                      <Card key={idx} className="border-gray-200">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <div className="flex-1">
                              <span className="font-medium">{action.name}</span>
                              <span className="text-gray-500 text-sm ml-2">
                                ({action.task_id})
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={getActionBadgeColor(action.type)}
                            >
                              {action.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Proposed Tasks from LLM */}
                {message.proposedTasks && message.proposedTasks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Tasks ที่แนะนำ:
                    </p>
                    {message.proposedTasks.map((task) => (
                      <TaskProposalCard
                        key={task.id}
                        task={task}
                        onAccept={(t) => handleAcceptTask(message.id, t)}
                        onEdit={(t) => handleEditTask(message.id, t)}
                        onReject={(t) => handleRejectTask(message.id, t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">กำลังคิด...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative flex items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="พิมพ์ข้อความ"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[52px] max-h-32"
                  rows={1}
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="h-[52px] px-6 shrink-0 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              กด Enter เพื่อส่งข้อความ, Shift + Enter เพื่อขึ้นบรรทัดใหม่
            </p>
          </div>
        </div>
      </main>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
          setEditingMessageId(null);
        }}
        onSave={(editedTask) => {
          if (editingMessageId) {
            handleSaveEditedTask(editingMessageId, editedTask);
          }
        }}
      />
    </div>
  );
}
