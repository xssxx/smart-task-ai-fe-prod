"use client";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Clock, Crown, Loader2 } from "lucide-react";
import { useInvitations } from "@/hooks/useInvitations";
import { useInvitationActions } from "@/hooks/useInvitationActions";
import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";

const MyInvitationsList = () => {
    const t = useTranslations();
    const { invitations, loading, refetch } = useInvitations();
    const { acceptInvitation, rejectInvitation, loading: actionLoading } = useInvitationActions();
    const { refetch: refetchProjects } = useProjects();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getInitials = (name: string) => {
        if (name) return name.substring(0, 2).toUpperCase();
        return "??";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const isExpiringSoon = (expiresAt: string) => {
        const daysUntilExpiry = Math.ceil(
            (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 7;
    };

    const handleAccept = async (projectId: string, inviteeAccountId: string) => {
        setProcessingId(inviteeAccountId);
        const success = await acceptInvitation(projectId, inviteeAccountId);
        if (success) {
            refetch(); // Refresh invitations list
            refetchProjects(); // Refresh projects list to show new workspace
        }
        setProcessingId(null);
    };

    const handleReject = async (projectId: string, inviteeAccountId: string) => {
        setProcessingId(inviteeAccountId);
        const success = await rejectInvitation(projectId, inviteeAccountId);
        if (success) {
            refetch(); // Refresh invitations list
        }
        setProcessingId(null);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                        {t('invitations.noInvitations')}
                    </p>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                        {t('invitations.noInvitationsDescription')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {invitations.map((invitation) => (
                <Card key={invitation.invitee_account_id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="w-10 h-10 shrink-0">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-sm">
                                        {getInitials(invitation.project_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base sm:text-lg truncate">
                                        {invitation.project_name}
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        {t('invitations.invitedBy')} {invitation.inviter_name}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge
                                variant={invitation.role === "admin" ? "default" : "secondary"}
                                className="flex items-center gap-1 text-xs shrink-0"
                            >
                                {invitation.role === "admin" && <Crown className="w-3 h-3" />}
                                {t(`invitations.role${invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}`)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{t('invitations.invited')} {formatDate(invitation.created_at)}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${isExpiringSoon(invitation.expires_at) ? 'invitation-warning-text font-medium' : ''}`}>
                                <Clock className="w-4 h-4" />
                                <span>{t('invitations.expires')} {formatDate(invitation.expires_at)}</span>
                            </div>
                        </div>

                        {isExpiringSoon(invitation.expires_at) && (
                            <div className="invitation-warning-bg rounded-lg p-3">
                                <p className="text-xs invitation-warning-text">
                                    {t('invitations.expiringSoonWarning')}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                onClick={() => handleAccept(invitation.project_id, invitation.invitee_account_id)}
                                disabled={actionLoading && processingId === invitation.invitee_account_id}
                                className="flex-1 invitation-success-btn"
                            >
                                {actionLoading && processingId === invitation.invitee_account_id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t('invitations.accepting')}
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        {t('invitations.accept')}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleReject(invitation.project_id, invitation.invitee_account_id)}
                                disabled={actionLoading && processingId === invitation.invitee_account_id}
                                className="flex-1 invitation-danger-btn"
                            >
                                {actionLoading && processingId === invitation.invitee_account_id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t('invitations.rejecting')}
                                    </>
                                ) : (
                                    <>
                                        <X className="w-4 h-4 mr-2" />
                                        {t('invitations.reject')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default MyInvitationsList;
