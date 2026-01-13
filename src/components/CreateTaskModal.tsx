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
import { Loader2 } from "lucide-react";
import { createTask, CreateTaskRequest } from "@/services/api";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TOAST_DURATION } from "@/constants";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId: string;
  defaultStatus?: string;
}

export default function CreateTaskModal({
  open,
  onOpenChange,
  onSuccess,
  projectId,
  defaultStatus = "todo",
}: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDateTime, setStartDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [endDateTime, setEndDateTime] = useState<{ date?: Date | null, hasTime: boolean }>({ hasTime: true });
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: "",
    description: "",
    priority: "medium",
    status: defaultStatus,
    location: "",
  });

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

    try {
      setIsLoading(true);
      setError(null);
      
      // Removed blue loading toast - will be replaced with notification system later
      
      const payload: CreateTaskRequest = {
        name: formData.name.trim(),
      };
      
      if (formData.description?.trim()) payload.description = formData.description.trim();
      if (formData.priority) payload.priority = formData.priority;
      if (formData.status) payload.status = formData.status;
      if (startDateTime.date) payload.start_date_time = startDateTime.date.toISOString();
      if (endDateTime.date) payload.end_date_time = endDateTime.date.toISOString();
      if (formData.location?.trim()) payload.location = formData.location.trim();

      await createTask(projectId, payload);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        status: defaultStatus,
        location: "",
      });
      setStartDateTime({ hasTime: true });
      setEndDateTime({ hasTime: true });
      
      toast.success("สร้าง Task สำเร็จ", {
        description: `Task "${payload.name}" ถูกสร้างเรียบร้อยแล้ว`,
        duration: TOAST_DURATION.SUCCESS,
      });
      onOpenChange(false);
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


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
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
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
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
              isDisabled={isLoading}
              placeholder="เลือกวันเวลาเริ่มต้น"
            />
          </div>

          {/* End DateTime */}
          <div className="space-y-2">
            <Label>วันเวลาสิ้นสุด</Label>
            <DateTimePicker
              value={endDateTime}
              onChange={setEndDateTime}
              isDisabled={isLoading}
              placeholder="เลือกวันเวลาสิ้นสุด"
            />
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

          <div className="flex justify-end gap-3 pt-4 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
