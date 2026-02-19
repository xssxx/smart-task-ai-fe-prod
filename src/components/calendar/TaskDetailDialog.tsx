"use client";

import { useState, useEffect, memo } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Loader2, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTaskById, updateTask, deleteTask, UpdateTaskRequest } from "@/services/api";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { toast } from "@/lib/enhanced-toast";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TOAST_DURATION, getPriorityColor } from "@/constants";
import { getPriorityKey, getStatusKey } from "@/lib/task-utils";

interface TaskDetailDialogTask {
  id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
}

interface TaskDetailDialogProject {
  id: string;
  name: string;
  config?: {
    color?: string;
  };
}

interface TaskDetailDialogProps {
  task: TaskDetailDialogTask | null;
  project: TaskDetailDialogProject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

interface TaskFormData {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  start_datetime: string | null;
  end_datetime: string | null;
  location: string | null;
  recurring_days: number | null;
  recurring_until: string | null;
}

function TaskDetailDialog({
  task,
  project,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: true });
  const [recurringUntil, setRecurringUntil] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: false });
  const [recurringEndType, setRecurringEndType] = useState<"never" | "on_date">("never");

  const [formData, setFormData] = useState<TaskFormData>({
    id: "",
    name: "",
    description: "",
    priority: "medium",
    status: "todo",
    start_datetime: null,
    end_datetime: null,
    location: null,
    recurring_days: null,
    recurring_until: null,
  });

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskData();
    }
    if (!isOpen) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [isOpen, task?.id]);

  const fetchTaskData = async () => {
    if (!task?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getTaskById(task.id);
      const taskData = response.data?.data;

      if (taskData) {
        const rawTask = taskData as unknown as Record<string, unknown>;
        const statusValue = typeof rawTask.status === 'string'
          ? rawTask.status.toLowerCase()
          : 'todo';

        const startDateTimeValue = (rawTask.start_datetime || rawTask.startDateTime) as string | null;
        const endDateTimeValue = (rawTask.end_datetime || rawTask.endDateTime) as string | null;
        const locationValue = (rawTask.location) as string | null;
        const recurringDaysValue = (rawTask.recurring_days || rawTask.recurringDays) as number | null;
        const recurringUntilValue = (rawTask.recurring_until || rawTask.recurringUntil) as string | null;

        setFormData({
          id: taskData.id,
          name: taskData.name || "",
          description: taskData.description || "",
          priority: taskData.priority?.toLowerCase() || "medium",
          status: statusValue === 'in_progress' || statusValue === 'inprogress' ? 'in_progress' : statusValue,
          start_datetime: startDateTimeValue || null,
          end_datetime: endDateTimeValue || null,
          location: locationValue || null,
          recurring_days: recurringDaysValue || null,
          recurring_until: recurringUntilValue || null,
        });

        setStartDateTime({
          date: startDateTimeValue ? new Date(startDateTimeValue) : null,
          hasTime: true,
        });
        setEndDateTime({
          date: endDateTimeValue ? new Date(endDateTimeValue) : null,
          hasTime: true,
        });
        setRecurringUntil({
          date: recurringUntilValue ? new Date(recurringUntilValue) : null,
          hasTime: false,
        });
        setRecurringEndType(recurringUntilValue ? "on_date" : "never");
      }
    } catch (err) {
      setError(t('task.cannotLoadTask'));
      toast.error(t('common.error'), {
        description: t('task.cannotLoadTask'),
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError(t('task.pleaseEnterTaskName'));
      toast.error(t('task.incompleteData'), {
        description: t('task.pleaseEnterTaskName'),
        duration: TOAST_DURATION.ERROR,
      });
      return;
    }

    if (startDateTime.date && endDateTime.date) {
      if (endDateTime.date <= startDateTime.date) {
        setError(t('task.endDateMustBeAfterStart'));
        toast.error(t('task.invalidData'), {
          description: t('task.endDateMustBeAfterStart'),
          duration: TOAST_DURATION.ERROR,
        });
        return;
      }

      // Validate recurring for multi-day tasks
      if (formData.recurring_days && formData.recurring_days > 0) {
        const daysDiff = Math.ceil((endDateTime.date.getTime() - startDateTime.date.getTime()) / (1000 * 60 * 60 * 24));
        if (formData.recurring_days <= daysDiff) {
          setError(t('task.recurringOverlapWarning', { days: daysDiff, recurring: formData.recurring_days }));
          toast.error(t('task.invalidData'), {
            description: t('task.recurringOverlapSuggestion', { days: daysDiff, suggested: daysDiff + 1 }),
            duration: TOAST_DURATION.ERROR,
          });
          return;
        }
      }
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload: UpdateTaskRequest = {
        name: formData.name.trim(),
        priority: formData.priority,
        status: formData.status,
      };

      payload.description = formData.description?.trim() || null;
      payload.location = formData.location?.trim() || null;
      payload.start_datetime = startDateTime.date ? startDateTime.date.toISOString() : null;
      payload.end_datetime = endDateTime.date ? endDateTime.date.toISOString() : null;
      if (formData.recurring_days && formData.recurring_days > 0) {
        payload.recurring_days = formData.recurring_days;
        if (recurringEndType === "on_date" && recurringUntil.date) {
          payload.recurring_until = recurringUntil.date.toISOString();
        } else {
          payload.recurring_until = null;
        }
      } else {
        payload.recurring_days = null;
        payload.recurring_until = null;
      }

      await updateTask(formData.id, payload);

      setIsEditing(false);
      toast.success(t('task.taskUpdatedSuccess'), {
        description: t('task.taskUpdatedDescription', { name: formData.name }),
        duration: TOAST_DURATION.SUCCESS,
      });
      onClose();
      onUpdate();
    } catch (err) {
      setError(t('task.taskUpdateFailedDescription'));
      toast.error(t('task.taskUpdateFailed'), {
        description: t('task.taskUpdateFailedDescription'),
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isDateRangeInvalid = startDateTime.date && endDateTime.date && endDateTime.date <= startDateTime.date;

  const handleClose = () => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!formData.id) return;

    try {
      setIsDeleting(true);
      setError(null);
      await deleteTask(formData.id);
      setShowDeleteConfirm(false);
      toast.success(t('task.taskDeletedSuccess'), {
        description: t('task.taskDeletedDescription', { name: formData.name }),
        duration: TOAST_DURATION.SUCCESS,
      });
      onClose();
      onDelete();
    } catch (err) {
      setError(t('task.taskDeleteFailedDescription'));
      toast.error(t('task.taskDeleteFailed'), {
        description: t('task.taskDeleteFailedDescription'),
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{t('task.taskDetails')}</DialogTitle>
              {!isEditing && !isLoading && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                  {error}
                </div>
              )}

              {project && (
                <div className="space-y-2">
                  <Label htmlFor="project">{t('project.workspaceName')}</Label>
                  <Input
                    id="project"
                    value={project.name}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t('task.taskName')} <span className="text-rose-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={t('task.namePlaceholder')}
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('task.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder={t('task.descriptionPlaceholder')}
                  rows={3}
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('task.priority')} <span className="text-rose-500">*</span></Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                    disabled={!isEditing || isSaving}
                  >
                    <SelectTrigger className={cn("w-full", !isEditing && "bg-gray-50")}>
                      <SelectValue placeholder={t('task.selectPriority')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                getPriorityColor(opt.value)
                              )}
                            />
                            {t(getPriorityKey(opt.value))}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('task.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                    disabled={!isEditing || isSaving}
                  >
                    <SelectTrigger className={cn("w-full", !isEditing && "bg-gray-50")}>
                      <SelectValue placeholder={t('task.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(getStatusKey(opt.value))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('task.startDateTime')}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DateTimePicker
                      value={startDateTime}
                      onChange={setStartDateTime}
                      isDisabled={!isEditing || isSaving}
                      placeholder={t('task.selectStartDateTime')}
                    />
                  </div>
                  {isEditing && startDateTime.date && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setStartDateTime({ date: null, hasTime: true })}
                      disabled={isSaving}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('task.endDateTime')}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DateTimePicker
                      value={endDateTime}
                      onChange={setEndDateTime}
                      isDisabled={!isEditing || isSaving || formData.status !== 'todo'}
                      placeholder={t('task.selectEndDateTime')}
                    />
                  </div>
                  {isEditing && endDateTime.date && formData.status === 'todo' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setEndDateTime({ date: null, hasTime: true })}
                      disabled={isSaving}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {isDateRangeInvalid && (
                  <p className="text-xs text-rose-600">
                    {t('task.endDateMustBeAfterStart')}
                  </p>
                )}
                {formData.status !== 'todo' && (
                  <p className="text-xs text-muted-foreground">
                    {t('task.cannotEditEndDateWhenNotTodo')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('task.location')}</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder={t('task.locationPlaceholder')}
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurringDays">{t('task.recurring')}</Label>
                <Select
                  value={formData.recurring_days ? formData.recurring_days.toString() : "0"}
                  onValueChange={(value) => {
                    const numValue = parseInt(value);
                    setFormData((prev) => ({
                      ...prev,
                      recurring_days: numValue === 0 ? null : numValue
                    }));
                    if (numValue === 0) {
                      setRecurringEndType("never");
                      setRecurringUntil({ hasTime: false });
                    }
                  }}
                  disabled={!isEditing || isSaving}
                >
                  <SelectTrigger className={cn("w-full", !isEditing && "bg-gray-50")}>
                    <SelectValue placeholder={t('task.noRecurring')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('task.noRecurring')}</SelectItem>
                    <SelectItem value="1">{t('task.daily')}</SelectItem>
                    <SelectItem value="7">{t('task.weekly')}</SelectItem>
                    <SelectItem value="14">{t('task.biweekly')}</SelectItem>
                    <SelectItem value="30">{t('task.monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurring_days && formData.recurring_days > 0 && (
                <>
                  <div className="space-y-2">
                    <Label>{t('task.recurringEnd')}</Label>
                    <Select
                      value={recurringEndType}
                      onValueChange={(value: "never" | "on_date") => {
                        setRecurringEndType(value);
                        if (value === "never") {
                          setRecurringUntil({ hasTime: false });
                        }
                      }}
                      disabled={!isEditing || isSaving}
                    >
                      <SelectTrigger className={cn("w-full", !isEditing && "bg-gray-50")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">{t('task.never')}</SelectItem>
                        <SelectItem value="on_date">{t('task.onDate')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurringEndType === "on_date" && (
                    <div className="space-y-2">
                      <Label>{t('task.recurringEndDate')}</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <DateTimePicker
                            value={recurringUntil}
                            onChange={setRecurringUntil}
                            isDisabled={!isEditing || isSaving}
                            placeholder={t('task.selectRecurringEndDate')}
                          />
                        </div>
                        {isEditing && recurringUntil.date && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setRecurringUntil({ date: null, hasTime: false })}
                            disabled={isSaving}
                            className="shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 flex-col sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchTaskData();
                    }}
                    disabled={isSaving}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      t('common.save')
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">{t('task.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('task.confirmDeleteDescription', { name: formData.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
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

// Memoize component to prevent unnecessary re-renders
export default memo(TaskDetailDialog);
