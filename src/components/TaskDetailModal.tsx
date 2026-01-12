"use client";
import { useState, useEffect } from "react";
import { Pencil, Loader2, Trash2 } from "lucide-react";
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
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TOAST_DURATION } from "@/constants";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  taskId: string | null;
}

interface TaskData {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  start_datetime: string | null;
  end_datetime: string | null;
}

export default function TaskDetailModal({
  open,
  onOpenChange,
  onSuccess,
  taskId,
}: TaskDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  
  const [formData, setFormData] = useState<TaskData>({
    id: "",
    name: "",
    description: "",
    priority: "medium",
    status: "todo",
    start_datetime: null,
    end_datetime: null,
  });

  useEffect(() => {
    if (open && taskId) {
      fetchTaskData();
    }
    if (!open) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  const fetchTaskData = async () => {
    if (!taskId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Show info toast when loading (will use 2 seconds)
      toast.info("กำลังโหลดข้อมูล Task", {
        description: "กรุณารอสักครู่...",
        duration: TOAST_DURATION.INFO,
      });
      
      const response = await getTaskById(taskId);
      const task = response.data?.data;
      
      if (task) {
        // Type assertion for API response with flexible field names
        const rawTask = task as unknown as Record<string, unknown>;
        const statusValue = typeof rawTask.status === 'string' 
          ? rawTask.status.toLowerCase() 
          : 'todo';
        
        const startDateTimeValue = (rawTask.start_datetime || rawTask.startDateTime) as string | null;
        const endDateTimeValue = (rawTask.end_datetime || rawTask.endDateTime) as string | null;
        
        setFormData({
          id: task.id,
          name: task.name || "",
          description: task.description || "",
          priority: task.priority?.toLowerCase() || "medium",
          status: statusValue === 'in_progress' || statusValue === 'inprogress' ? 'in_progress' : statusValue,
          start_datetime: startDateTimeValue || null,
          end_datetime: endDateTimeValue || null,
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
      console.error("Error fetching task:", err);
      setError("ไม่สามารถโหลดข้อมูล Task ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ Task");
      return;
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
        payload.start_date_time = startDateTime.date.toISOString();
      }
      if (endDateTime.date) {
        payload.end_date_time = endDateTime.date.toISOString();
      }

      await updateTask(formData.id, payload);
      
      setIsEditing(false);
      toast.success("บันทึก Task สำเร็จ", {
        description: `Task "${formData.name}" ถูกอัพเดทเรียบร้อยแล้ว`,
        duration: TOAST_DURATION.SUCCESS,
      });
      onSuccess();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("ไม่สามารถบันทึก Task ได้ กรุณาลองใหม่");
      toast.error("บันทึก Task ไม่สำเร็จ", {
        description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        duration: TOAST_DURATION.ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof TaskData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleClose = () => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    onOpenChange(false);
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
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Error deleting task:", err);
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
    <Dialog open={open} onOpenChange={handleClose}>
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
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ Task <span className="text-red-500">*</span></Label>
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
                <Label>Priority</Label>
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
                        {opt.label}
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

            {/* Start DateTime */}
            <div className="space-y-2">
              <Label>วันเวลาเริ่มต้น</Label>
              <DateTimePicker
                value={startDateTime}
                onChange={setStartDateTime}
                isDisabled={!isEditing || isSaving}
                placeholder="เลือกวันเวลาเริ่มต้น"
              />
            </div>

            {/* End DateTime */}
            <div className="space-y-2">
              <Label>วันเวลาสิ้นสุด</Label>
              <DateTimePicker
                value={endDateTime}
                onChange={setEndDateTime}
                isDisabled={!isEditing || isSaving}
                placeholder="เลือกวันเวลาสิ้นสุด"
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบ Task</DialogTitle>
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
    </Dialog>
  );
}
