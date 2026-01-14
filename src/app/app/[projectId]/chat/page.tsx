"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  PanelRight,
} from "lucide-react";
import { sendChatMessage, createTask, CreateTaskRequest } from "@/services/api";
import { ChatMessage, Message, ProposedTask } from "@/types/chat";
import { getActionBadgeColor, PRIORITY_OPTIONS } from "@/constants";
import { format } from "date-fns";
import { th } from "date-fns/locale";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

// Edit Proposed Task Modal Component
interface EditProposedTaskModalProps {
  task: ProposedTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ProposedTask, location?: string, recurringDays?: number) => void;
}

function EditProposedTaskModal({ task, isOpen, onClose, onSave }: EditProposedTaskModalProps) {
  const [editedTask, setEditedTask] = useState<ProposedTask | null>(null);
  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [location, setLocation] = useState("");
  const [recurringDays, setRecurringDays] = useState<number | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setStartDateTime({
        date: task.start_datetime ? new Date(task.start_datetime) : null,
        hasTime: true,
      });
      setEndDateTime({
        date: task.end_datetime ? new Date(task.end_datetime) : null,
        hasTime: true,
      });
      setLocation("");
      setRecurringDays(null);
    }
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    const updatedTask = {
      ...editedTask,
      start_datetime: startDateTime.date?.toISOString() || editedTask.start_datetime,
      end_datetime: endDateTime.date?.toISOString() || editedTask.end_datetime,
    };
    onSave(updatedTask, location || undefined, recurringDays || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไข Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ Task <span className="text-red-500">*</span></Label>
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
            <Label>Priority <span className="text-red-500">*</span></Label>
            <Select
              value={editedTask.priority}
              onValueChange={(value: "high" | "medium" | "low") =>
                setEditedTask({ ...editedTask, priority: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start DateTime */}
          <div className="space-y-2">
            <Label>วันเวลาเริ่มต้น</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DateTimePicker
                  value={startDateTime}
                  onChange={setStartDateTime}
                  placeholder="เลือกวันเวลาเริ่มต้น"
                />
              </div>
              {startDateTime.date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setStartDateTime({ date: null, hasTime: true })}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* End DateTime */}
          <div className="space-y-2">
            <Label>วันเวลาสิ้นสุด</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DateTimePicker
                  value={endDateTime}
                  onChange={setEndDateTime}
                  placeholder="เลือกวันเวลาสิ้นสุด"
                />
              </div>
              {endDateTime.date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setEndDateTime({ date: null, hasTime: true })}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">สถานที่</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ห้องประชุม A, Online"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurringDays">ทำซ้ำทุกๆ (วัน)</Label>
            <Input
              id="recurringDays"
              type="number"
              min="0"
              value={recurringDays ?? ""}
              onChange={(e) => setRecurringDays(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="เช่น 7 สำหรับทำซ้ำทุกสัปดาห์"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-1" />
            บันทึกและยอมรับ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
        <div className="flex flex-col gap-3">
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
                <span className="text-[11px] sm:text-xs">
                  {formatDateTime(task.start_datetime)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">
                  ถึง {formatDateTime(task.end_datetime)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons or status */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
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
              <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-green-600 border-green-300 hover:bg-green-50 flex-1"
                  onClick={() => onAccept(task)}
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Accept</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-blue-600 border-blue-300 hover:bg-blue-50 flex-1"
                  onClick={() => onEdit(task)}
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-red-600 border-red-300 hover:bg-red-50 flex-1"
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

  // Right panel state - default open on desktop, closed on mobile
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check screen size and set default panel state
  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 1024; // lg breakpoint
      setIsDesktop(desktop);
    };
    
    // Initial check
    checkScreenSize();
    // Set initial panel state based on screen size
    setIsRightPanelOpen(window.innerWidth >= 1024);
    
    // Listen for resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get all proposed tasks from all messages
  const getAllProposedTasks = () => {
    const allTasks: { messageId: string; task: ProposedTask }[] = [];
    messages.forEach((msg) => {
      if (msg.proposedTasks) {
        msg.proposedTasks.forEach((task) => {
          allTasks.push({ messageId: msg.id, task });
        });
      }
    });
    return allTasks;
  };

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

      const responseData = response.data.data;
      
      // Convert backend tasks to ProposedTask format
      const proposedTasks = responseData.tasks?.map((task, idx) => ({
        id: `proposed-${Date.now()}-${idx}`,
        name: task.name,
        description: task.description || "",
        priority: (task.priority || "medium") as "high" | "medium" | "low",
        status: "todo" as const,
        start_datetime: task.start_datetime || new Date().toISOString(),
        end_datetime: task.end_datetime || new Date().toISOString(),
        userAction: "pending" as const,
      }));

      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: responseData.message,
        timestamp: new Date(),
        taskActions: responseData.task_actions,
        proposedTasks: proposedTasks && proposedTasks.length > 0 ? proposedTasks : undefined,
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
  const proposedTaskToRequest = (task: ProposedTask, location?: string, recurringDays?: number): CreateTaskRequest => ({
    name: task.name,
    description: task.description,
    priority: task.priority,
    start_datetime: task.start_datetime,
    end_datetime: task.end_datetime,
    ...(location && { location }),
    ...(recurringDays && recurringDays > 0 && { recurring_days: recurringDays }),
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

  // Handle edit task - open modal with task data
  const handleEditTask = (messageId: string, task: ProposedTask) => {
    setEditingTask(task);
    setEditingMessageId(messageId);
    setIsEditModalOpen(true);
  };

  // Handle reject task
  const handleRejectTask = (messageId: string, task: ProposedTask) => {
    updateTaskAction(messageId, task.id, "rejected");
  };

  // Handle save edited task - create task and mark as accepted
  const handleSaveEditedTask = async (editedTask: ProposedTask, location?: string, recurringDays?: number) => {
    if (!editingMessageId) return;
    
    try {
      const payload = proposedTaskToRequest(editedTask, location, recurringDays);
      await createTask(projectId, payload);
      
      // Mark as accepted
      updateTaskAction(editingMessageId, editedTask.id, "accepted");
      
      // Close modal
      setIsEditModalOpen(false);
      setEditingTask(null);
      setEditingMessageId(null);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("ไม่สามารถสร้าง task ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="flex h-full">
        {/* Main Chat Area */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ${isRightPanelOpen ? 'mr-0' : ''}`}>
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={isRightPanelOpen ? "bg-gray-100" : ""}
              >
                <PanelRight className="w-5 h-5" />
              </Button>
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

                  {/* Proposed Tasks notification - show only when panel is closed */}
                  {!isRightPanelOpen && message.proposedTasks && message.proposedTasks.length > 0 && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRightPanelOpen(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        ดู {message.proposedTasks.length} Tasks ที่แนะนำ
                      </Button>
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

        {/* Right Panel - Proposed Tasks */}
        <aside 
          className={`
            ${isRightPanelOpen ? 'w-80 lg:w-96 opacity-100' : 'w-0 opacity-0'} 
            bg-white border-l border-gray-200 flex flex-col h-full
            transition-all duration-300 ease-in-out overflow-hidden
            fixed right-0 top-0 lg:relative z-40
          `}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between min-w-[320px] lg:min-w-[384px]">
            <div>
              <h3 className="font-semibold text-gray-900">Tasks ที่แนะนำ</h3>
              <p className="text-xs text-gray-500">
                {getAllProposedTasks().length} tasks จาก AI
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightPanelOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-w-[320px] lg:min-w-[384px]">
            {getAllProposedTasks().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Flag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">ยังไม่มี tasks ที่แนะนำ</p>
                <p className="text-xs mt-1">ลองถาม AI เพื่อสร้าง tasks ใหม่</p>
              </div>
            ) : (
              getAllProposedTasks().map(({ messageId, task }) => (
                <TaskProposalCard
                  key={task.id}
                  task={task}
                  onAccept={(t) => handleAcceptTask(messageId, t)}
                  onEdit={(t) => handleEditTask(messageId, t)}
                  onReject={(t) => handleRejectTask(messageId, t)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Overlay for mobile when panel is open */}
        {isRightPanelOpen && !isDesktop && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setIsRightPanelOpen(false)}
          />
        )}
      </div>

      {/* Edit Proposed Task Modal */}
      <EditProposedTaskModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
          setEditingMessageId(null);
        }}
        onSave={handleSaveEditedTask}
      />
    </div>
  );
}
