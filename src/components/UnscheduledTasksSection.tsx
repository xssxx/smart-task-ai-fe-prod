"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Calendar, Folder, Trash2, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPriorityColor, getStatusColor } from "@/constants";
import { getStatusKey } from "@/lib/task-utils";
import { TaskWithProject, updateTask } from "@/services/api";
import { toast } from "@/lib/enhanced-toast";

interface UnscheduledTasksSectionProps {
  tasks: TaskWithProject[];
  onDelete: (taskId: string) => Promise<void>;
  onTaskClick?: (taskId: string) => void;
  onStatusChange?: () => void;
}

export default function UnscheduledTasksSection({
  tasks,
  onDelete,
  onTaskClick,
  onStatusChange,
}: UnscheduledTasksSectionProps) {
  const t = useTranslations();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, task: TaskWithProject) => {
    e.stopPropagation();
    setSelectedTask(task);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    try {
      setDeletingTaskId(selectedTask.id);
      await onDelete(selectedTask.id);
      setShowDeleteConfirm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedTask(null);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setUpdatingTaskId(taskId);
      await updateTask(taskId, { status: newStatus });
      toast.success(t('task.statusUpdatedSuccess'));
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error(t('task.statusUpdateFailed'));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCardClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5" />
            {t('dashboard.unscheduledTasks')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.unscheduledTasksDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className={tasks.length === 0 ? "" : tasks.length <= 3 ? "" : "max-h-[500px] overflow-y-auto"}>
          {tasks.length === 0 ? (
            <div className="py-8 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">{t('dashboard.noUnscheduledTasks')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 md:gap-6 p-4 md:p-6 border rounded-lg hover:bg-gray-50 transition-colors min-h-[140px] cursor-pointer"
                  onClick={() => handleCardClick(task.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 text-gray-600">
                      <Folder className="w-4 h-4 shrink-0" />
                      <span className="text-sm truncate">{task.project.name}</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                      <h4 className="text-lg md:text-2xl font-semibold text-gray-900 truncate">
                        {task.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(task.priority)} shrink-0 text-xs md:text-sm`}
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm md:text-base text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 md:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(task.status)} px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium rounded-md whitespace-nowrap`}
                    >
                      {t(getStatusKey(task.status))}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 md:h-10 md:w-10 p-0"
                          disabled={updatingTaskId === task.id}
                        >
                          {updatingTaskId === task.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleStatusChange(task.id, "todo")}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#737373]"></span>
                            {t('status.todo')}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00a6f4]"></span>
                            {t('status.inProgress')}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleStatusChange(task.id, "in_review")}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#f0b100]"></span>
                            {t('status.inReview')}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleStatusChange(task.id, "done")}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#7ccf00]"></span>
                            {t('status.done')}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 md:h-10 md:w-10 p-0"
                      onClick={(e) => handleDeleteClick(e, task)}
                      disabled={deletingTaskId === task.id}
                    >
                      {deletingTaskId === task.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">{t('task.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('task.confirmDeleteDescription', { name: selectedTask?.name || '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deletingTaskId !== null}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingTaskId !== null}
            >
              {deletingTaskId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.deleting')}
                </>
              ) : (
                t('common.delete')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
