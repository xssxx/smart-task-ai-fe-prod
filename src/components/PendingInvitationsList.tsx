"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { XCircle, Loader2, Crown } from "lucide-react";
import { useProjectInvitations } from "@/hooks/useProjectInvitations";
import { useInvitationActions } from "@/hooks/useInvitationActions";

interface PendingInvitationsListProps {
  projectId: string;
}

const PendingInvitationsList = ({ projectId }: PendingInvitationsListProps) => {
  const t = useTranslations();
  const { invitations, loading, refetch } = useProjectInvitations(projectId);
  const { cancelInvitation, loading: actionLoading } = useInvitationActions();
  const [cancellingInvitation, setCancellingInvitation] = useState<{
    inviteeAccountId: string;
    inviteeName: string;
  } | null>(null);

  const getInitials = (name: string, shortId: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    return shortId.substring(0, 2).toUpperCase();
  };

  const handleCancelClick = (inviteeAccountId: string, inviteeName: string) => {
    setCancellingInvitation({ inviteeAccountId, inviteeName });
  };

  const handleConfirmCancel = async () => {
    if (!cancellingInvitation) return;

    const success = await cancelInvitation(projectId, cancellingInvitation.inviteeAccountId);
    if (success) {
      setCancellingInvitation(null);
      refetch();
    }
  };

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          {t('invitations.pendingInvitations')} ({invitations.length})
        </h3>
        <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg"
                >
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-4 w-24 sm:w-32" />
                    <Skeleton className="h-3 w-16 sm:w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 sm:h-9 sm:w-20 shrink-0" />
                </div>
              ))}
            </>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
              {t('invitations.noPendingInvitations')}
            </p>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.invitee_account_id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {getInitials(invitation.invitee_name, invitation.invitee_short_id)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {invitation.invitee_name || invitation.invitee_short_id}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('invitations.invited')} {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Badge
                    variant={invitation.role === "admin" ? "default" : "secondary"}
                    className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
                  >
                    {invitation.role === "admin" && <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                    {t(`invitations.role${invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}`)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCancelClick(invitation.invitee_account_id, invitation.invitee_name || invitation.invitee_short_id)}
                    className="h-7 w-7 sm:h-9 sm:w-9 invitation-danger-icon"
                  >
                    <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!cancellingInvitation} onOpenChange={() => !actionLoading && setCancellingInvitation(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 invitation-danger-dialog-title text-base sm:text-lg">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('invitations.cancelInvitation')}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t('common.cannotUndo')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="invitation-danger-dialog-bg rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm invitation-danger-dialog-text">
                {t('invitations.confirmCancelInvitation')}
              </p>
              <p className="text-sm sm:text-base font-semibold invitation-danger-dialog-text mt-2 break-all">
                {cancellingInvitation?.inviteeName}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancellingInvitation(null)}
              disabled={actionLoading}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={actionLoading}
              className="w-full sm:w-auto invitation-success-btn"
              style={{ backgroundColor: 'var(--invitation-danger)', color: 'white' }}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('invitations.cancelling')}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('invitations.cancelInvitation')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingInvitationsList;
