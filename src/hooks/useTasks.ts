import { useState, useCallback } from "react";
import { listTasksByProject, Task } from "@/services/api";

/**
 * Custom hook for managing tasks
 */
export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await listTasksByProject(projectId, 100, 0);
      const items = response.data?.data?.items ?? [];
      setTasks(Array.isArray(items) ? items : []);
    } catch (err) {
      setError("ไม่สามารถโหลด tasks ได้");
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    refetch,
  };
}
