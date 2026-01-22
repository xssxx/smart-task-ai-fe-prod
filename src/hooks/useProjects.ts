import { useState, useEffect, useCallback } from "react";
import { listProjects, Project } from "@/services/api";

/**
 * Custom hook for managing projects
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listProjects();
      const items = response.data?.data?.items ?? [];
      setProjects(Array.isArray(items) ? items : []);
    } catch (err) {
      setError("ไม่สามารถโหลดโปรเจกต์ได้");
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Listen for project updates from other components
  useEffect(() => {
    const handleProjectsUpdated = () => {
      fetchProjects();
    };

    window.addEventListener('projectsUpdated', handleProjectsUpdated);
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdated);
    };
  }, [fetchProjects]);

  const refetch = useCallback(() => {
    fetchProjects();
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('projectsUpdated'));
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch,
  };
}
