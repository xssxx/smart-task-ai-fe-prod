"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createTask, CreateTaskRequest, Project } from "@/services/api";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/constants";

interface CreateTaskFromHomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projects: Project[];
}

export default function CreateTaskFromHomeModal({
  open,
  onOpenChange,
  onSuccess,
  projects,
}: CreateTaskFromHomeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: "",
    description: "",
    priority: "medium",
    status: "todo",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ Task");
      return;
    }
    if (!selectedProjectId) {
      setError("กรุณาเลือก Project");
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
      if (formData.status) payload.status = formData.status;
      if (startDate) payload.start_date_time = startDate.toISOString();
      if (endDate) payload.end_date_time = endDate.toISOString();
      if (formData.location?.trim()) payload.location = formData.location.trim();

      await createTask(selectedProjectId, payload);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        status: "todo",
        location: "",
      });
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedProjectId("");
      
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError("ไม่สามารถสร้าง Task ได้ กรุณาลองใหม่");
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
            <Label>Project <span className="text-red-500">*</span></Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือก Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>วันเริ่มต้น</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>เลือกวันที่</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>วันสิ้นสุด</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>เลือกวันที่</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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