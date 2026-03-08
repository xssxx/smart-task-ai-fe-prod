"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { removeProjectMember, type Project } from "@/services/api";
import { toast } from "@/lib/enhanced-toast";

interface LeaveWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project: Project | null;
  accountId: string;
}

const LeaveWorkspaceModal = ({
  open,
  onOpenChange,
  onSuccess,
  project,
  accountId,
}: LeaveWorkspaceModalProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    if (!project) return;

    setIsLeaving(true);
    try {
      await removeProjectMember(project.id, accountId);
      toast.success(t('sidebar.leaveSuccess'), {
        description: project.name,
      });
      onSuccess();
      onOpenChange(false);
      router.push("/app/home");
    } catch (error: any) {
      toast.error(t('sidebar.leaveFailed'), {
        description: error?.response?.data?.message || t('common.error'),
      });
    } finally {
      setIsLeaving(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 text-base sm:text-lg">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('sidebar.leaveWorkspace')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('common.cannotUndo')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              {t('sidebar.confirmLeaveWorkspace', { name: project.name })}
            </p>
            <p className="text-sm sm:text-base font-semibold text-rose-800 dark:text-rose-300 mt-2">
              {project.name}
            </p>
            <p className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-500 mt-2">
              {t('sidebar.confirmLeaveWarning')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLeaving}
            className="w-full sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleLeave}
            disabled={isLeaving}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isLeaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('sidebar.leaving')}
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                {t('sidebar.leave')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveWorkspaceModal;
