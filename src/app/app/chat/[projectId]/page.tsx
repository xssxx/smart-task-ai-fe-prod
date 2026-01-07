"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Sparkles,
  CheckCircle2,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { sendChatMessage, sendChatMessageStream } from "@/services/api";
import { ChatMessage, Message } from "@/types/chat";

export default function AIChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

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

    if (useStreaming) {
      await handleStreamingResponse(input, sessionHistory);
    } else {
      await handleNonStreamingResponse(input, sessionHistory);
    }
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

      const aiResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.data.data.message,
        timestamp: new Date(),
        taskActions: response.data.data.task_actions,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาลองใหม่อีกครั้ง";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingResponse = async (
    content: string,
    sessionHistory: Message[]
  ) => {
    setStreamingContent("");
    
    const streamingMsgId = Date.now().toString();
    
    sendChatMessageStream(
      projectId,
      { content, session_history: sessionHistory },
      (chunk) => {
        setStreamingContent((prev) => prev + chunk);
      },
      () => {
        setStreamingContent((prev) => {
          const finalContent = prev;
          setMessages((msgs) => [
            ...msgs,
            {
              id: streamingMsgId,
              role: "assistant",
              content: finalContent,
              timestamp: new Date(),
            },
          ]);
          return "";
        });
        setIsLoading(false);
      },
      (errorMsg) => {
        setError(errorMsg);
        setStreamingContent("");
        setIsLoading(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case "created":
        return "bg-green-100 text-green-800 border-green-200";
      case "updated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "deleted":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
          <p className="text-gray-600 mt-2">Please select a project from the sidebar</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="h-screen flex flex-col max-w-5xl mx-auto">
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
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
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Streaming:</label>
              <input
                type="checkbox"
                checked={useStreaming}
                onChange={(e) => setUseStreaming(e.target.checked)}
                className="rounded"
              />
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
              {/* Avatar */}
              <div className="shrink-0">
                {message.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
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

              {/* Message Content */}
              <div
                className={`flex-1 ${
                  message.role === "user" ? "flex justify-end" : ""
                }`}
              >
                <div
                  className={`inline-block max-w-2xl ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
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
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp?.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) || ""}
                  </p>
                </div>

                {/* Task Actions */}
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
              </div>
            </div>
          ))}

          {/* Streaming content */}
          {streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-2xl">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {streamingContent}
                </p>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
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
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="พิมพ์ข้อความ... (เช่น 'สร้าง task ชื่อ ประชุมทีม priority high')"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[52px] max-h-32"
                  rows={1}
                  style={{
                    height: "auto",
                  }}
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
                className="h-[52px] px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              กด Enter เพื่อส่งข้อความ, Shift + Enter เพื่อขึ้นบรรทัดใหม่
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
