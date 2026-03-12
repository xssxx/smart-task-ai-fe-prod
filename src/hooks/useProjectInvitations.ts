import { useState, useCallback, useEffect } from "react";
import {
  getProjectInvitations,
  type InvitationResponse,
} from "@/services/api";
import { toast } from "sonner";
export const useProjectInvitations = (projectId: string) => {
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getProjectInvitations(projectId);
      if (response.data.success) {
        setInvitations(response.data.data.invitations);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to load project invitations";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    refetch: fetchInvitations,
  };
};
