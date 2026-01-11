"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Calendar,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getPriorityColor } from "@/types/board";
import { listTasksByProject, Task as ApiTask, updateTask } from "@/services/api";
import CreateTaskModal from "@/components/CreateTaskModal";

interface BoardTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  assignees: string[];
  dueDate: string;
  comments: number;
  attachments: number;
  tags: string[];
  status: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: BoardTask[];
}

function transformApiTask(apiTask: ApiTask): BoardTask {
  return {
    id: apiTask.id,
    title: apiTask.name,
    description: apiTask.description || "",
    priority: apiTask.priority?.toLowerCase() || "medium",
    assignees: [],
    dueDate: apiTask.endDateTime
      ? new Date(apiTask.endDateTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "",
    comments: 0,
    attachments: 0,
    tags: [],
    status: mapApiStatus(apiTask.status),
  };
}


function mapApiStatus(status: ApiTask["status"] | string): string {
  if (typeof status === "string") {
    const s = status.toLowerCase();
    if (s === "todo" || s === "to do") return "todo";
    if (s === "in_progress" || s === "inprogress" || s === "in-progress") return "in-progress";
    if (s === "review") return "review";
    if (s === "done" || s === "completed") return "done";
  }
  return "todo";
}

function mapColumnToApiStatus(columnId: string): string {
  switch (columnId) {
    case "todo": return "todo";
    case "in-progress": return "in_progress";
    case "review": return "review";
    case "done": return "done";
    default: return "todo";
  }
}

function DraggableTaskCard({ task, columnId }: { task: BoardTask; columnId: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task, columnId },
  });

  if (isDragging) {
    return (
      <Card ref={setNodeRef} className="border-gray-200 opacity-30 border-dashed">
        <CardContent className="p-4 invisible"><h4 className="font-medium">{task.title}</h4></CardContent>
      </Card>
    );
  }

  return (
    <Card ref={setNodeRef} {...listeners} {...attributes} className="border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing touch-manipulation">
      <CardContent className="p-4 cursor-pointer select-none">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
            {task.description && <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>}
          </div>
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, idx) => <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">{tag}</Badge>)}
            </div>
          )}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            {task.dueDate && <div className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />{task.dueDate}</div>}
          </div>
          {(task.assignees.length > 0 || task.comments > 0 || task.attachments > 0) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex -space-x-2">
                {task.assignees.map((assignee, idx) => (
                  <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee}`} />
                    <AvatarFallback className="text-xs">{assignee.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                {task.comments > 0 && <div className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /><span className="text-xs">{task.comments}</span></div>}
                {task.attachments > 0 && <div className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /><span className="text-xs">{task.attachments}</span></div>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({ column, children, isOver }: { column: Column; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <Card ref={setNodeRef} className={`h-full transition-all ${isOver ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <CardTitle className="text-base">{column.title}</CardTitle>
            <Badge variant="secondary" className="ml-1">{column.tasks.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function TaskCardOverlay({ task }: { task: BoardTask }) {
  return (
    <Card className="shadow-2xl border-2 border-blue-400 cursor-move w-[280px]">
      <CardContent className="p-4 select-none">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
            {task.description && <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>}
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            {task.dueDate && <div className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />{task.dueDate}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ColumnSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between"><Skeleton className="h-5 w-16" /><Skeleton className="h-4 w-12" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}


export default function BoardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", color: "bg-gray-500", tasks: [] },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500", tasks: [] },
    { id: "review", title: "Review", color: "bg-yellow-500", tasks: [] },
    { id: "done", title: "Done", color: "bg-green-500", tasks: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState("todo");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await listTasksByProject(projectId, 100, 0);
      const items = response.data?.data?.items ?? [];
      
      const tasksByStatus: Record<string, BoardTask[]> = { todo: [], "in-progress": [], review: [], done: [] };
      items.forEach((apiTask) => {
        const boardTask = transformApiTask(apiTask);
        if (tasksByStatus[boardTask.status]) {
          tasksByStatus[boardTask.status].push(boardTask);
        } else {
          tasksByStatus.todo.push(boardTask);
        }
      });

      setColumns((prev) => prev.map((col) => ({ ...col, tasks: tasksByStatus[col.id] || [] })));
    } catch (err) {
      setError("ไม่สามารถโหลด tasks ได้");
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const scrollToColumn = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const columnWidth = container.scrollWidth / columns.length;
      container.scrollTo({ left: columnWidth * index, behavior: "smooth" });
      setCurrentColumnIndex(index);
    }
  }, [columns.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (isDraggingTask) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isDraggingTask) return;
        const columnWidth = container.scrollWidth / columns.length;
        const nearestIndex = Math.round(container.scrollLeft / columnWidth);
        const clampedIndex = Math.max(0, Math.min(nearestIndex, columns.length - 1));
        if (clampedIndex !== currentColumnIndex) setCurrentColumnIndex(clampedIndex);
        container.scrollTo({ left: columnWidth * clampedIndex, behavior: "smooth" });
      }, 150);
    };
    container.addEventListener("scroll", handleScroll);
    return () => { container.removeEventListener("scroll", handleScroll); clearTimeout(scrollTimeout); };
  }, [columns.length, currentColumnIndex, isDraggingTask]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskData = event.active.data.current as { task: BoardTask; columnId: string };
    setActiveTask(taskData.task);
    setActiveColumnId(taskData.columnId);
    setIsDraggingTask(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverColumnId(event.over ? (event.over.id as string) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event;
    if (!over || !activeTask || !activeColumnId) {
      setActiveTask(null);
      setActiveColumnId(null);
      setOverColumnId(null);
      setIsDraggingTask(false);
      return;
    }

    const targetColumnId = over.id as string;
    if (activeColumnId !== targetColumnId) {
      setColumns((prev) => prev.map((col) => {
        if (col.id === activeColumnId) return { ...col, tasks: col.tasks.filter((t) => t.id !== activeTask.id) };
        if (col.id === targetColumnId) return { ...col, tasks: [...col.tasks, { ...activeTask, status: targetColumnId }] };
        return col;
      }));

      try {
        await updateTask(activeTask.id, { status: mapColumnToApiStatus(targetColumnId) });
      } catch (err) {
        console.error("Failed to update task status:", err);
        fetchTasks();
      }
    }

    setActiveTask(null);
    setActiveColumnId(null);
    setOverColumnId(null);
    setIsDraggingTask(false);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setActiveColumnId(null);
    setOverColumnId(null);
    setIsDraggingTask(false);
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
      <main className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="hidden sm:block">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Board</h2>
              <p className="text-gray-600">Manage your tasks with a visual kanban board</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchTasks} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
              </Button>
              <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
              <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Search</Button>
              <Button size="sm" onClick={() => { setCreateTaskDefaultStatus("todo"); setShowCreateModal(true); }}><Plus className="w-4 h-4 mr-2" />New Task</Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchTasks} className="ml-auto">ลองใหม่</Button>
          </div>
        )}

        <div className="flex md:hidden items-center justify-between mb-4 px-2">
          <Button variant="ghost" size="sm" onClick={() => scrollToColumn(Math.max(0, currentColumnIndex - 1))} disabled={currentColumnIndex === 0}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            {columns.map((col, idx) => (
              <button key={col.id} onClick={() => scrollToColumn(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentColumnIndex ? col.color : "bg-gray-300"}`} />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => scrollToColumn(Math.min(columns.length - 1, currentColumnIndex + 1))} disabled={currentColumnIndex === columns.length - 1}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div ref={scrollContainerRef} className={`flex gap-4 overflow-x-auto pb-4 md:overflow-x-visible md:snap-none ${isDraggingTask ? "" : "snap-x snap-mandatory scroll-smooth"}`} style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {isLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="shrink-0 w-[85vw] md:w-80 snap-center"><ColumnSkeleton /></div>)
            ) : (
              columns.map((column) => (
                <div key={column.id} className="shrink-0 w-[85vw] md:w-80 snap-center">
                  <DroppableColumn column={column} isOver={overColumnId === column.id}>
                    {column.tasks.map((task) => <DraggableTaskCard key={task.id} task={task} columnId={column.id} />)}
                    <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900" onClick={() => { setCreateTaskDefaultStatus(column.id === "in-progress" ? "in_progress" : column.id); setShowCreateModal(true); }}><Plus className="w-4 h-4 mr-2" />Add task</Button>
                  </DroppableColumn>
                </div>
              ))
            )}
          </div>
          <DragOverlay>{activeTask ? <TaskCardOverlay task={activeTask} /> : null}</DragOverlay>
        </DndContext>

        <CreateTaskModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={fetchTasks}
          projectId={projectId}
          defaultStatus={createTaskDefaultStatus}
        />
      </main>
    </div>
  );
}
