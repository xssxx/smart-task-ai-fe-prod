import { useState, useCallback } from "react";
import {
    createInvitation as createInvitationAPI,
    acceptInvitation as acceptInvitationAPI,
    rejectInvitation as rejectInvitationAPI,
    cancelInvitation as cancelInvitationAPI,
    type CreateInvitationRequest,
    type InvitationResponse,
} from "@/services/api";
import { toast } from "sonner";

export const useInvitationActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const createInvitation = useCallback(
        async (
            projectId: string,
            payload: CreateInvitationRequest,
        ): Promise<InvitationResponse | null> => {
            setLoading(true);
            setError(null);
            try {
                const response = await createInvitationAPI(projectId, payload);
                if (response.data.success) {
                    toast.success("Invitation sent successfully");
                    return response.data.data;
                }
                return null;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Failed to create invitation";
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const acceptInvitation = useCallback(
        async (projectId: string, inviteeAccountId: string): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const response = await acceptInvitationAPI(projectId, inviteeAccountId);
                if (response.data.success) {
                    toast.success("Invitation accepted successfully");
                    return true;
                }
                return false;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Failed to accept invitation";
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const rejectInvitation = useCallback(
        async (projectId: string, inviteeAccountId: string): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const response = await rejectInvitationAPI(projectId, inviteeAccountId);
                if (response.data.success) {
                    toast.success("Invitation rejected successfully");
                    return true;
                }
                return false;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Failed to reject invitation";
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const cancelInvitation = useCallback(
        async (projectId: string, inviteeAccountId: string): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const response = await cancelInvitationAPI(projectId, inviteeAccountId);
                if (response.data.success) {
                    toast.success("Invitation cancelled successfully");
                    return true;
                }
                return false;
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || "Failed to cancel invitation";
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        createInvitation,
        acceptInvitation,
        rejectInvitation,
        cancelInvitation,
        loading,
        error,
    };
};
