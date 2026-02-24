"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const projectName = project.name;
      await deleteProject(project.id);
      
      toast.success(t('project.workspaceDeletedSuccess'), {
        description: (
          <>
            Workspace <strong>{projectName}</strong> {t('project.workspaceDeletedDescription', { name: '' }).replace('{name}', '').trim()}
          </>
        ),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(t('project.workspaceDeleteFailedDescription'));
      toast.error(t('project.workspaceDeleteFailed'), {
        description: t('project.workspaceDeleteFailedDescription'),
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 text-base sm:text-lg">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('project.deleteWorkspace')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('project.cannotUndo')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg p-3 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              {t('project.confirmDeleteWorkspace', { name: project.name })}
            </p>
            <p className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-500 mt-2">
              {t('project.confirmDeleteWarning')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('common.deleting')}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {t('project.deleteWorkspace')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}