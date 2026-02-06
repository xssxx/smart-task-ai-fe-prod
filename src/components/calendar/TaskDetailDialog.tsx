"use client";

import { useState, useEffect, memo } from "react";
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
import { toast } from "sonner";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TOAST_DURATION, getPriorityColor } from "@/constants";

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
}

function TaskDetailDialog({
  task,
  project,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null; hasTime: boolean }>({ hasTime: true });

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
        });

        setStartDateTime({
          date: startDateTimeValue ? new Date(startDateTimeValue) : null,
          hasTime: true,
        });
        setEndDateTime({
          date: endDateTimeValue ? new Date(endDateTimeValue) : null,
          hasTime: true,
        });
      }
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูล Task ได้");
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูล Task ได้",
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ Task");
      toast.error("ข้อมูลไม่ครบถ้วน", {
        description: "กรุณากรอกชื่อ Task",
        duration: TOAST_DURATION.ERROR,
      });
      return;
    }

    if (startDateTime.date && endDateTime.date) {
      if (endDateTime.date <= startDateTime.date) {
        setError("วันเวลาสิ้นสุดต้องมากกว่าวันเวลาเริ่มต้น");
        toast.error("ข้อมูลไม่ถูกต้อง", {
          description: "วันเวลาสิ้นสุดต้องมากกว่าวันเวลาเริ่มต้น",
          duration: TOAST_DURATION.ERROR,
        });
        return;
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

      if (formData.description?.trim()) {
        payload.description = formData.description.trim();
      }

      if (startDateTime.date) {
        payload.start_datetime = startDateTime.date.toISOString();
      }
      if (endDateTime.date) {
        payload.end_datetime = endDateTime.date.toISOString();
      }
      if (formData.location?.trim()) {
        payload.location = formData.location.trim();
      }
      if (formData.recurring_days && formData.recurring_days > 0) {
        payload.recurring_days = formData.recurring_days;
      }

      await updateTask(formData.id, payload);

      setIsEditing(false);
      toast.success("บันทึก Task สำเร็จ", {
        description: `Task "${formData.name}" ถูกอัพเดทเรียบร้อยแล้ว`,
        duration: TOAST_DURATION.SUCCESS,
      });
      onClose();
      onUpdate();
    } catch (err) {
      setError("ไม่สามารถบันทึก Task ได้ กรุณาลองใหม่");
      toast.error("บันทึก Task ไม่สำเร็จ", {
        description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
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
      toast.success("ลบ Task สำเร็จ", {
        description: `Task "${formData.name}" ถูกลบเรียบร้อยแล้ว`,
        duration: TOAST_DURATION.SUCCESS,
      });
      onClose();
      onDelete();
    } catch (err) {
      setError("ไม่สามารถลบ Task ได้ กรุณาลองใหม่");
      toast.error("ลบ Task ไม่สำเร็จ", {
        description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
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
              <DialogTitle>รายละเอียด Task</DialogTitle>
              {!isEditing && !isLoading && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
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

              {/* Project Field */}
              {project && (
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={project.name}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ Task <span className="text-rose-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="เช่น ประชุมทีม, Review code"
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  rows={3}
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority <span className="text-rose-500">*</span></Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                    disabled={!isEditing || isSaving}
                  >
                    <SelectTrigger className={cn("w-full", !isEditing && "bg-gray-50")}>
                      <SelectValue placeholder="เลือก Priority" />
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
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                    disabled={!isEditing || isSaving}
                  >
                    <SelectTrigger className={cn("w-full", !isEditing && "bg-gray-50")}>
                      <SelectValue placeholder="เลือก Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>วันเวลาเริ่มต้น</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DateTimePicker
                      value={startDateTime}
                      onChange={setStartDateTime}
                      isDisabled={!isEditing || isSaving}
                      placeholder="เลือกวันเวลาเริ่มต้น"
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
                <Label>วันเวลาสิ้นสุด</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DateTimePicker
                      value={endDateTime}
                      onChange={setEndDateTime}
                      isDisabled={!isEditing || isSaving}
                      placeholder="เลือกวันเวลาสิ้นสุด"
                    />
                  </div>
                  {isEditing && endDateTime.date && (
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
                    วันเวลาสิ้นสุดต้องมากกว่าวันเวลาเริ่มต้น
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">สถานที่</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="เช่น ห้องประชุม A, Online"
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurringDays">ทำซ้ำทุกๆ (วัน)</Label>
                <Input
                  id="recurringDays"
                  type="number"
                  min="0"
                  value={formData.recurring_days ?? ""}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    recurring_days: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  placeholder="เช่น 7 สำหรับทำซ้ำทุกสัปดาห์"
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

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
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      "บันทึก"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">ยืนยันการลบ Task</DialogTitle>
            <DialogDescription>
              คุณต้องการลบ Task &quot;{formData.name}&quot; หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                "ลบ Task"
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
