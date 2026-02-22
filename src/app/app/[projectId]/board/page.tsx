"use client";
import { useState, useRef, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Check,
} from "lucide-react";
import {
  listTasksByProject,
  Task as ApiTask,
  updateTask,
} from "@/services/api";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import { toast } from "@/lib/enhanced-toast";
import { getPriorityColor, TOAST_DURATION } from "@/constants";
import { mapApiStatus, mapColumnToApiStatus } from "@/lib/task-utils";

interface BoardTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
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
    dueDate: apiTask.end_datetime
      ? new Date(apiTask.end_datetime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      : "",
    status: mapApiStatus(apiTask.status),
  };
}

function DraggableTaskCard({
  task,
  columnId,
  onTaskClick,
}: {
  task: BoardTask;
  columnId: string;
  onTaskClick: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task, columnId },
  });

  const handleClick = () => {
    if (!isDragging) {
      onTaskClick(task.id);
    }
  };

  if (isDragging) {
    return (
      <Card
        ref={setNodeRef}
        className="border-gray-200 opacity-30 border-dashed"
      >
        <CardContent className="p-4 invisible">
          <h4 className="font-medium">{task.title}</h4>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing touch-manipulation"
      onClick={handleClick}
    >
      <CardContent className="p-4 cursor-pointer select-none">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={getPriorityColor(task.priority)}
            >
              {task.priority}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {task.dueDate}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  column,
  children,
  isOver,
}: {
  column: Column;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <Card
      ref={setNodeRef}
      className={`h-full flex flex-col transition-all ${isOver ? "ring-2 ring-gray-900 ring-offset-2" : ""
        }`}
    >
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
            <CardTitle className="text-base">{column.title}</CardTitle>
            <Badge variant="secondary" className="ml-1">
              {column.tasks.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-y-auto">{children}</CardContent>
    </Card>
  );
}

function TaskCardOverlay({ task }: { task: BoardTask }) {
  return (
    <Card className="shadow-2xl border-2 border-gray-900 cursor-move w-[280px]">
      <CardContent className="p-4 select-none">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={getPriorityColor(task.priority)}
            >
              {task.priority}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {task.dueDate}
              </div>
            )}
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
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
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
    { id: "todo", title: "รอดำเนินการ", color: "bg-zinc-500", tasks: [] },
    {
      id: "in_progress",
      title: "กำลังดำเนินการ",
      color: "bg-sky-500",
      tasks: [],
    },
    { id: "in_review", title: "รอตรวจสอบ", color: "bg-yellow-500", tasks: [] },
    { id: "done", title: "เสร็จสิ้น", color: "bg-lime-500", tasks: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] =
    useState("todo");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"todo-to-done" | "done-to-todo">(
    "todo-to-done"
  );
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(
    new Set(["todo", "in_progress", "in_review", "done"])
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    })
  );

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await listTasksByProject(projectId, 100, 0);
      const items = response.data?.data?.items ?? [];

      const tasksByStatus: Record<string, BoardTask[]> = {
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
      };
      items.forEach((apiTask) => {
        const boardTask = transformApiTask(apiTask);
        if (tasksByStatus[boardTask.status]) {
          tasksByStatus[boardTask.status].push(boardTask);
        } else {
          tasksByStatus.todo.push(boardTask);
        }
      });

      setColumns((prev) =>
        prev.map((col) => ({ ...col, tasks: tasksByStatus[col.id] || [] }))
      );
    } catch (err) {
      setError("ไม่สามารถโหลด tasks ได้");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const visibleColumns = columns.filter((col) => visibleStatuses.has(col.id));
  const gapSize = 16;
  const totalGaps = Math.max(0, visibleColumns.length - 1) * gapSize;
  const safetyMargin = 8;
  const columnWidthCalc = visibleColumns.length > 0
    ? `calc((100% - ${totalGaps + safetyMargin}px) / ${visibleColumns.length})`
    : '100%';

  const scrollToColumn = useCallback(
    (index: number) => {
      if (scrollContainerRef.current && window.innerWidth < 1024) {
        const container = scrollContainerRef.current;
        const columnWidth = container.scrollWidth / visibleColumns.length;
        container.scrollTo({ left: columnWidth * index, behavior: "smooth" });
        setCurrentColumnIndex(index);
      }
    },
    [visibleColumns.length]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isMobileOrTabletPortrait = () => window.innerWidth < 1024;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (isDraggingTask || !isMobileOrTabletPortrait()) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isDraggingTask || !isMobileOrTabletPortrait()) return;
        const columnWidth = container.scrollWidth / visibleColumns.length;
        const nearestIndex = Math.round(container.scrollLeft / columnWidth);
        const clampedIndex = Math.max(
          0,
          Math.min(nearestIndex, visibleColumns.length - 1)
        );
        if (clampedIndex !== currentColumnIndex)
          setCurrentColumnIndex(clampedIndex);
        container.scrollTo({
          left: columnWidth * clampedIndex,
          behavior: "smooth",
        });
      }, 150);
    };

    const handleResize = () => {
      if (!isMobileOrTabletPortrait()) {
        container.scrollTo({ left: 0, behavior: "auto" });
        setCurrentColumnIndex(0);
      }
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(scrollTimeout);
    };
  }, [visibleColumns.length, currentColumnIndex, isDraggingTask]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskData = event.active.data.current as {
      task: BoardTask;
      columnId: string;
    };
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
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === activeColumnId)
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeTask.id),
            };
          if (col.id === targetColumnId)
            return {
              ...col,
              tasks: [...col.tasks, { ...activeTask, status: targetColumnId }],
            };
          return col;
        })
      );

      try {
        await updateTask(activeTask.id, {
          status: mapColumnToApiStatus(targetColumnId),
        });
        toast.success("อัพเดท Status สำเร็จ", {
          description: (
            <>
              ย้าย <strong>{activeTask.title}</strong> ไปยัง <strong>{targetColumn?.title || targetColumnId}</strong>
            </>
          ),
          duration: TOAST_DURATION.SUCCESS,
        });
      } catch (err) {
        toast.error("อัพเดท Status ไม่สำเร็จ", {
          description: "เกิดข้อผิดพลาด กำลังโหลดข้อมูลใหม่...",
          duration: TOAST_DURATION.ERROR,
        });
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

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowDetailModal(true);
  };

  const handleSortChange = async (order: "todo-to-done" | "done-to-todo") => {
    setSortOrder(order);
    setIsApplyingFilter(true);

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    setColumns((prev) => {
      const newColumns = [...prev];
      if (order === "done-to-todo") {
        return newColumns.reverse();
      }
      return [
        { id: "todo", title: "รอดำเนินการ", color: "bg-zinc-500", tasks: [] },
        {
          id: "in_progress",
          title: "กำลังดำเนินการ",
          color: "bg-sky-500",
          tasks: [],
        },
        { id: "in_review", title: "รอตรวจสอบ", color: "bg-yellow-500", tasks: [] },
        { id: "done", title: "เสร็จสิ้น", color: "bg-lime-500", tasks: [] },
      ].map((col) => {
        const existingCol = prev.find((c) => c.id === col.id);
        return existingCol ? { ...col, tasks: existingCol.tasks } : col;
      });
    });

    setIsApplyingFilter(false);
  };

  const handleStatusToggle = (statusId: string) => {
    setVisibleStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(statusId)) {
        if (newSet.size > 1) {
          newSet.delete(statusId);
        }
      } else {
        newSet.add(statusId);
      }
      return newSet;
    });
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            ไม่พบโปรเจกต์
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col p-4 lg:p-6 w-full overflow-hidden">
        <div className="mb-4 lg:mb-6 shrink-0">
          {/* Page Title */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 lg:hidden">
            บอร์ด
          </h1>
          
          {/* Page Subtitle and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-base sm:text-lg text-gray-600">
              จัดการงานของคุณด้วยบอร์ด Kanban
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={fetchTasks}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""
                    } sm:mr-2`}
                />
                <span className="hidden sm:inline">รีเฟรช</span>
              </Button>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default">
                    <Filter className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">ตัวกรอง</span>
                    {visibleStatuses.size < 4 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {visibleStatuses.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* Sort Section */}
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    เรียงลำดับคอลัมน์
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("todo-to-done")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>รอดำเนินการ → เสร็จสิ้น</span>
                      {sortOrder === "todo-to-done" && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("done-to-todo")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>เสร็จสิ้น → รอดำเนินการ</span>
                      {sortOrder === "done-to-todo" && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Status Filter Section */}
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    แสดง Status
                  </DropdownMenuLabel>
                  {columns.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      className="cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleStatusToggle(column.id);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Checkbox
                          checked={visibleStatuses.has(column.id)}
                          onCheckedChange={() => handleStatusToggle(column.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                        <span className="flex-1">{column.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {column.tasks.length}
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">ค้นหา</span>
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setCreateTaskDefaultStatus("todo");
                  setShowCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                สร้างงานใหม่
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span className="text-rose-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTasks}
              className="ml-auto"
            >
              ลองใหม่
            </Button>
          </div>
        )}

        <div className="flex lg:hidden items-center justify-between mb-4 px-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToColumn(Math.max(0, currentColumnIndex - 1))}
            disabled={currentColumnIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            {visibleColumns.map((col, idx) => (
              <button
                key={col.id}
                onClick={() => scrollToColumn(idx)}
                className={`board-nav-dot ${idx === currentColumnIndex ? "active" : ""
                  }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              scrollToColumn(
                Math.min(visibleColumns.length - 1, currentColumnIndex + 1)
              )
            }
            disabled={currentColumnIndex === visibleColumns.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            ref={scrollContainerRef}
            className={`flex-1 flex gap-3 lg:gap-4 overflow-y-hidden pb-4 overflow-x-auto lg:overflow-x-hidden ${isDraggingTask ? "" : "snap-x snap-mandatory scroll-smooth lg:snap-none"
              }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              ['--column-width' as string]: columnWidthCalc,
            }}
          >
            {isLoading || isApplyingFilter
              ? [1, 2, 3, 4].slice(0, visibleStatuses.size).map((i) => (
                <div
                  key={i}
                  className={`board-column shrink-0 snap-center h-full ${visibleStatuses.size === 1 ? 'single' : ''}`}
                >
                  <ColumnSkeleton />
                </div>
              ))
              : visibleColumns.map((column) => (
                <div
                  key={column.id}
                  className={`board-column shrink-0 snap-center h-full ${visibleColumns.length === 1 ? 'single' : ''}`}
                >
                  <DroppableColumn
                    column={column}
                    isOver={overColumnId === column.id}
                  >
                    {column.tasks.map((task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        columnId={column.id}
                        onTaskClick={handleTaskClick}
                      />
                    ))}
                  </DroppableColumn>
                </div>
              ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>

        <CreateTaskModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={fetchTasks}
          projectId={projectId}
        />

        <TaskDetailModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onSuccess={fetchTasks}
          taskId={selectedTaskId}
        />
      </main>
    </div>
  );
}
