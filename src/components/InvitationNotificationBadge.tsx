"use client";
import { Badge } from "@/components/ui/badge";
import { useInvitations } from "@/hooks/useInvitations";

const InvitationNotificationBadge = () => {
    const { invitations, loading } = useInvitations();

    if (loading || invitations.length === 0) {
        return null;
    }

    return (
        <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1 text-[10px] font-semibold rounded-full"
        >
            {invitations.length > 99 ? '99+' : invitations.length}
        </Badge>
    );
};

export default InvitationNotificationBadge;
