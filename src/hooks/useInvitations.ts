import { useState, useCallback, useEffect } from "react";
import { getMyInvitations, type InvitationResponse } from "@/services/api";
import { toast } from "sonner";
export const useInvitations = () => {
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyInvitations();
      if (response.data.success) {
        setInvitations(response.data.data.invitations);
      }
    } catch (err: any) {
      console.error('useInvitations - Error:', err);
      const errorMessage =
        err?.response?.data?.message || "Failed to load invitations";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

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
