"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, ChevronDown } from "lucide-react";
import { updateProject, UpdateProjectRequest, Project } from "@/services/api";
import { cn } from "@/lib/utils";

interface EditWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  project: Project | null;
}

export default function EditWorkspaceModal({
  open,
  onOpenChange,
  onSuccess,
  project,
}: EditWorkspaceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    context: "",
    domain_knowledge: "",
  });

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        nickname: project.config?.nickname || "",
        context: project.config?.context || "",
        domain_knowledge: project.config?.domain_knowledge || "",
      });
      setShowAdvanced(!!(project.config?.nickname || project.config?.context || project.config?.domain_knowledge));
    }
  }, [project]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setError(null);

    if (!formData.name.trim()) {
      setError("กรุณากรอกชื่อ Workspace");
      return;
    }

    setIsLoading(true);

    try {
      const payload: UpdateProjectRequest = {
        name: formData.name.trim(),
      };

      // Add config if any advanced fields are filled
      if (formData.nickname || formData.context || formData.domain_knowledge) {
        payload.config = {};
        if (formData.nickname) payload.config.nickname = formData.nickname;
        if (formData.context) payload.config.context = formData.context;
        if (formData.domain_knowledge) payload.config.domain_knowledge = formData.domain_knowledge;
      }

      await updateProject(project.id, payload);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error updating project:", err);
      setError("ไม่สามารถอัพเดท Workspace ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onOpenChange(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไข Workspace</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูล workspace &quot;{project.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Name Field (Required) */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              ชื่อ Workspace <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="เช่น My Project, Work Tasks"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {/* Advanced Settings Toggle */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    showAdvanced && "rotate-180"
                  )}
                />
                ตั้งค่า AI Assistant (ไม่บังคับ)
              </button>
            </CollapsibleTrigger>

            {/* Advanced Fields */}
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
                {/* Nickname Field */}
                <div className="space-y-2">
                  <Label htmlFor="nickname">ชื่อเล่น AI</Label>
                  <Input
                    id="nickname"
                    placeholder="เช่น Jarvis, Assistant"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    ตั้งชื่อเล่นให้ AI assistant ของคุณ
                  </p>
                </div>

                {/* Context Field */}
                <div className="space-y-2">
                  <Label htmlFor="context">Context</Label>
                  <Textarea
                    id="context"
                    placeholder="เช่น You are a helpful assistant for software developers."
                    value={formData.context}
                    onChange={(e) => handleInputChange("context", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    อธิบายบทบาทและหน้าที่ของ AI
                  </p>
                </div>

                {/* Domain Knowledge Field */}
                <div className="space-y-2">
                  <Label htmlFor="domain_knowledge">Domain Knowledge</Label>
                  <Textarea
                    id="domain_knowledge"
                    placeholder="เช่น Expert in Golang, Clean Architecture, and PostgreSQL"
                    value={formData.domain_knowledge}
                    onChange={(e) => handleInputChange("domain_knowledge", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    ความรู้เฉพาะทางที่ AI ควรมี
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}