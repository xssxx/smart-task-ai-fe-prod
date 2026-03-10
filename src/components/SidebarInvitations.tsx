"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, XCircle, Loader2, ChevronRight } from "lucide-react";
import { useMyInvitations } from "@/hooks/useMyInvitations";
import { useInvitationActions } from "@/hooks/useInvitationActions";
import { WORKSPACE_COLORS } from "@/constants";

interface SidebarInvitationsProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export const SidebarInvitations = ({
  onAccept,
  onReject,
}: SidebarInvitationsProps) => {
  const t = useTranslations();
  const {
    invitations,
    loading: invitationsLoading,
    refetch,
  } = useMyInvitations();
  const {
    acceptInvitation,
    rejectInvitation,
    loading: actionLoading,
  } = useInvitationActions();

  const handleAcceptInvitation = async (
    projectId: string,
    inviteeAccountId: string,
  ) => {
    const success = await acceptInvitation(projectId, inviteeAccountId);
    if (success) {
      // Refresh invitations list
      await refetch();
      // Call parent callback to refresh projects
      if (onAccept) {
        onAccept();
      }
    }
  };

  const handleRejectInvitation = async (
    projectId: string,
    inviteeAccountId: string,
  ) => {
    const success = await rejectInvitation(projectId, inviteeAccountId);
    if (success) {
      // Refresh invitations list
      await refetch();
      // Call parent callback
      if (onReject) {
        onReject();
      }
    }
  };

  // Don't render anything if still loading or no invitations
  if (invitationsLoading) {
    return null;
  }

  if (!invitations || invitations.length === 0) {
    return null;
  }

  return (
    <>
      {invitations.map((invitation) => (
        <div key={invitation.created_at} className="group">
          <div className="flex items-center gap-3 px-4 py-3">
            <div
              className={`w-3 h-3 rounded-full ${WORKSPACE_COLORS[Math.floor(Math.random() * WORKSPACE_COLORS.length)]}`}
            ></div>
            <div className="flex-1 min-w-0">
              <span className="truncate block text-sm font-medium">
                {invitation.project_name}
              </span>
              <span className="text-xs text-muted-foreground block">
                {t("invitations.invitedBy")} {invitation.inviter_name}
              </span>
            </div>
          </div>

          {/* Accept/Reject buttons */}
          <div className="flex gap-2 px-4 pb-3">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs flex-1 status-badge-done hover:opacity-80 transition-opacity"
              onClick={() =>
                handleAcceptInvitation(
                  invitation.project_id,
                  invitation.invitee_account_id,
                )
              }
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  {t("invitations.accept")}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs flex-1 priority-badge-high hover:opacity-80 transition-opacity"
              onClick={() =>
                handleRejectInvitation(
                  invitation.project_id,
                  invitation.invitee_account_id,
                )
              }
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  {t("invitations.reject")}
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </>
  );
};
