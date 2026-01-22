"use client";
import { useState } from "react";
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
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { PRIORITY_OPTIONS, TOAST_DURATION } from "@/constants";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId?: string;
  projects?: Project[];
}

export default function CreateTaskModal({
  open,
  onOpenChange,
  onSuccess,
  projectId,
  projects,
}: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [recurringDays, setRecurringDays] = useState<number | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "");
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: "",
    description: "",
    priority: "medium",
    location: "",
  });

  const needsProjectSelection = !projectId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ Task");
      toast.error("ข้อมูลไม่ครบถ้วน", {
        description: "กรุณากรอกชื่อ Task",
        duration: TOAST_DURATION.ERROR,
      });
      return;
    }

    if (needsProjectSelection && !selectedProjectId) {
      setError("กรุณาเลือก Project");
      toast.error("ข้อมูลไม่ครบถ้วน", {
        description: "กรุณาเลือก Project",
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

    const targetProjectId = projectId || selectedProjectId;
    if (!targetProjectId) {
      setError("ไม่พบ Project ID");
      return;
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
      if (recurringDays && recurringDays > 0) payload.recurring_days = recurringDays;

      await createTask(targetProjectId, payload);
      
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        location: "",
      });
      setStartDateTime({ hasTime: true });
      setEndDateTime({ hasTime: true });
      setRecurringDays(undefined);
      if (needsProjectSelection) {
        setSelectedProjectId("");
      }
      
      toast.success("สร้าง Task สำเร็จ", {
        description: `Task "${payload.name}" ถูกสร้างเรียบร้อยแล้ว`,
        duration: TOAST_DURATION.SUCCESS,
      });
      handleClose(false);
      onSuccess();
    } catch (err) {
      setError("ไม่สามารถสร้าง Task ได้ กรุณาลองใหม่");
      toast.error("สร้าง Task ไม่สำเร็จ", {
        description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
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

  const handleClose = (open: boolean) => {
    if (!open && !isLoading) {
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        location: "",
      });
      setStartDateTime({ hasTime: true });
      setEndDateTime({ hasTime: true });
      setRecurringDays(undefined);
      if (needsProjectSelection) {
        setSelectedProjectId("");
      }
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้าง Task ใหม่</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {needsProjectSelection && (
            <div className="space-y-2">
              <Label>Project <span className="text-red-500">*</span></Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                disabled={isLoading || !projects || projects.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={projects && projects.length > 0 ? "เลือก Project" : "ไม่มี Project"} />
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
                      ไม่มี Project
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ Task <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="เช่น ประชุมทีม, Review code"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority <span className="text-red-500">*</span></Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
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
            <Label>วันเวลาเริ่มต้น</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DateTimePicker
                  value={startDateTime}
                  onChange={setStartDateTime}
                  isDisabled={isLoading}
                  placeholder="เลือกวันเวลาเริ่มต้น"
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
            <Label>วันเวลาสิ้นสุด</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DateTimePicker
                  value={endDateTime}
                  onChange={setEndDateTime}
                  isDisabled={isLoading}
                  placeholder="เลือกวันเวลาสิ้นสุด"
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
              <p className="text-xs text-red-600">
                วันเวลาสิ้นสุดต้องมากกว่าวันเวลาเริ่มต้น
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">สถานที่</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="เช่น ห้องประชุม A, Online"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurringDays">ทำซ้ำทุกๆ (วัน)</Label>
            <Input
              id="recurringDays"
              type="number"
              min="0"
              value={recurringDays ?? ""}
              onChange={(e) => setRecurringDays(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="เช่น 7 สำหรับทำซ้ำทุกสัปดาห์"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                "สร้าง Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
