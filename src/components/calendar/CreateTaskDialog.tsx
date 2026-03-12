"use client";

import { useState, useEffect, memo } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, X } from "lucide-react";
import { createTask, CreateTaskRequest, Project } from "@/services/api";
import { toast } from "@/lib/enhanced-toast";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { PRIORITY_OPTIONS, TOAST_DURATION } from "@/constants";
import { getPriorityKey } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  isOpen: boolean;
  prefilledDate: Date | null;
  prefilledStartDate?: Date | null;
  projects: Project[];
  onClose: () => void;
  onCreate: () => void;
}

function CreateTaskDialog({
  isOpen,
  prefilledDate,
  prefilledStartDate,
  projects,
  onClose,
  onCreate,
}: CreateTaskDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: true });
  const [recurringDays, setRecurringDays] = useState<number | undefined>(undefined);
  const [recurringUntil, setRecurringUntil] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: false });
  const [recurringEndType, setRecurringEndType] = useState<"never" | "on_date">("never");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: "",
    description: "",
    priority: "medium",
    location: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (prefilledDate) {
        setEndDateTime({ date: prefilledDate, hasTime: true });
      }

      if (prefilledStartDate) {
        setStartDateTime({ date: prefilledStartDate, hasTime: true });
      }
    }
  }, [isOpen, prefilledDate, prefilledStartDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t('task.pleaseEnterTaskName'));
      toast.error(t('task.incompleteData'), {
        description: t('task.pleaseEnterTaskName'),
        duration: TOAST_DURATION.ERROR,
      });
      return;
    }

    if (!selectedProjectId) {
      setError(t('task.pleaseSelectProject'));
      toast.error(t('task.incompleteData'), {
        description: t('task.pleaseSelectProject'),
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

      if (recurringDays && recurringDays > 0) {
        const daysDiff = Math.ceil((endDateTime.date.getTime() - startDateTime.date.getTime()) / (1000 * 60 * 60 * 24));
        if (recurringDays <= daysDiff) {
          setError(t('task.recurringOverlapWarning', { days: daysDiff, recurring: recurringDays }));
          toast.error(t('task.invalidData'), {
            description: t('task.recurringOverlapSuggestion', { days: daysDiff, suggested: daysDiff + 1 }),
            duration: TOAST_DURATION.ERROR,
          });
          return;
        }
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload: CreateTaskRequest = {
        name: formData.name.trim(),
      };

      if (formData.description?.trim()) payload.description = formData.description.trim();
      if (formData.priority) payload.priority = formData.priority;
      if (startDateTime.date) payload.start_datetime = startDateTime.date.toISOString();
      if (endDateTime.date) payload.end_datetime = endDateTime.date.toISOString();
      if (formData.location?.trim()) payload.location = formData.location.trim();
      if (recurringDays && recurringDays > 0) {
        payload.recurring_days = recurringDays;
        if (recurringEndType === "on_date" && recurringUntil.date) {
          payload.recurring_until = recurringUntil.date.toISOString();
        }
      }

      await createTask(selectedProjectId, payload);

      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        location: "",
      });
      setStartDateTime({ hasTime: true });
      setEndDateTime({ hasTime: true });
      setRecurringDays(undefined);
      setRecurringUntil({ hasTime: false });
      setRecurringEndType("never");
      setSelectedProjectId("");

      toast.success(t('task.taskCreatedSuccess'), {
        description: t('task.taskCreatedDescription', { name: payload.name }),
        duration: TOAST_DURATION.SUCCESS,
      });

      handleClose();
      onCreate();
    } catch (err) {
      setError(t('task.taskCreateFailedDescription'));
      toast.error(t('task.taskCreateFailed'), {
        description: t('task.taskCreateFailedDescription'),
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateTaskRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isDateRangeInvalid = startDateTime.date && endDateTime.date && endDateTime.date <= startDateTime.date;

  const handleClose = () => {
    if (!isLoading) {
      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        location: "",
      });
      setStartDateTime({ hasTime: true });
      setEndDateTime({ hasTime: true });
      setRecurringDays(undefined);
      setRecurringUntil({ hasTime: false });
      setRecurringEndType("never");
      setSelectedProjectId("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('task.createNewTask')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('project.workspaceName')} <span className="text-rose-500">*</span></Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isLoading || !projects || projects.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={projects && projects.length > 0 ? t('task.selectProject') : t('sidebar.noProjects')} />
              </SelectTrigger>
              <SelectContent>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {t('sidebar.noProjects')}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('task.taskName')} <span className="text-rose-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t('task.namePlaceholder')}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('task.priority')} <span className="text-rose-500">*</span></Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('task.selectPriority')} />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", `priority-dot-${opt.value}`)} />
                      {t(getPriorityKey(opt.value))}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('task.startDateTime')}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DateTimePicker
                  value={startDateTime}
                  onChange={setStartDateTime}
                  isDisabled={isLoading}
                  placeholder={t('task.selectStartDateTime')}
                />
              </div>
              {startDateTime.date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setStartDateTime({ date: null, hasTime: true })}
                  disabled={isLoading}
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
                  isDisabled={isLoading}
                  placeholder={t('task.selectEndDateTime')}
                />
              </div>
              {endDateTime.date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setEndDateTime({ date: null, hasTime: true })}
                  disabled={isLoading}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('task.location')}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder={t('task.locationPlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurringDays">{t('task.recurring')}</Label>
            <Select
              value={recurringDays ? recurringDays.toString() : "0"}
              onValueChange={(value) => {
                const numValue = parseInt(value);
                setRecurringDays(numValue === 0 ? undefined : numValue);
                if (numValue === 0) {
                  setRecurringEndType("never");
                  setRecurringUntil({ hasTime: false });
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
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

          {recurringDays && recurringDays > 0 && (
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
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
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
                        isDisabled={isLoading}
                        placeholder={t('task.selectRecurringEndDate')}
                      />
                    </div>
                    {recurringUntil.date && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setRecurringUntil({ date: null, hasTime: false })}
                        disabled={isLoading}
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

          <div className="flex justify-end gap-3 pt-4 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.creating')}
                </>
              ) : (
                t('task.createTask')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(CreateTaskDialog);
