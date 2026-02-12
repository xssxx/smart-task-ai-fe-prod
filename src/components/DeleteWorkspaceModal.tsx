"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProject, Project } from "@/services/api";
import { toast } from "@/lib/enhanced-toast";

interface DeleteWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  project: Project | null;
}

export default function DeleteWorkspaceModal({
  open,
  onOpenChange,
  onSuccess,
  project,
}: DeleteWorkspaceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const projectName = project.name;
      await deleteProject(project.id);
      
      toast.success("ลบ Workspace สำเร็จ", {
        description: (
          <>
            Workspace <strong>{projectName}</strong> ถูกลบเรียบร้อยแล้ว
          </>
        ),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError("ไม่สามารถลบ Workspace ได้ กรุณาลองใหม่อีกครั้ง");
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถลบ Workspace ได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onOpenChange(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            ลบ Workspace
          </DialogTitle>
          <DialogDescription>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p className="text-sm text-rose-700">
              คุณแน่ใจหรือไม่ที่จะลบ workspace <strong>&quot;{project.name}&quot;</strong>?
            </p>
            <p className="text-xs text-rose-600 mt-2">
              ข้อมูลทั้งหมดใน workspace นี้จะถูกลบอย่างถาวร รวมถึง tasks และ chat history
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                กำลังลบ...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                ลบ Workspace
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}