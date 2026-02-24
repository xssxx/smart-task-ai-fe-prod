import { useState, useCallback } from "react";
import {
  addProjectMember,
  removeProjectMember,
  listProjectMembers,
  type ProjectMember,
  type AddMemberRequest,
} from "@/services/api";
import { toast } from "sonner";

const STORAGE_KEY = "member_email_map";

const loadEmailMap = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveEmailMap = (map: Record<string, string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

export const useProjectMembers = (projectId: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailMap, setEmailMap] = useState<Record<string, string>>(loadEmailMap);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listProjectMembers(projectId);
      if (response.data.success) {
        const fetchedMembers = response.data.data.members;
        setMembers(fetchedMembers);

        // If API returns email, cache it
        const emailsFromApi: Record<string, string> = {};
        fetchedMembers.forEach((m) => {
          if (m.email) emailsFromApi[m.account_id] = m.email;
        });

        if (Object.keys(emailsFromApi).length > 0) {
          setEmailMap((prev) => {
            const updated = { ...prev, ...emailsFromApi };
            saveEmailMap(updated);
            return updated;
          });
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to load members";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addMember = useCallback(
    async (payload: AddMemberRequest) => {
      try {
        const response = await addProjectMember(projectId, payload);
        if (response.data.success) {
          const accountId = response.data.data.account_id;
          setEmailMap((prev) => {
            const updated = { ...prev, [accountId]: payload.email };
            saveEmailMap(updated);
            return updated;
          });
          await fetchMembers();
          return true;
        }
        return false;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Failed to add member";
        toast.error(errorMessage);
        return false;
      }
    },
    [projectId, fetchMembers],
  );

  const removeMember = useCallback(
    async (accountId: string, role: string) => {
      if (role === "owner") {
        toast.error("Cannot remove project owner");
        return false;
      }

      try {
        const response = await removeProjectMember(projectId, accountId);
        if (response.data.success) {
          await fetchMembers();
          return true;
        }
        return false;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Failed to remove member";
        toast.error(errorMessage);
        return false;
      }
    },
    [projectId, fetchMembers],
  );

  return {
    members,
    loading,
    error,
    emailMap,
    fetchMembers,
    addMember,
    removeMember,
  };
};
