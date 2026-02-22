import { useCalendarTaskContext } from "@/contexts";
import { useCallback, useMemo } from "react";
import type { Project } from "@/services/api";
import { expandTasks, type ExpandedTask } from "@/lib/task-expansion-utils";

export interface TaskWithProject {
  id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  project_id: string;
  recurring_days?: number;
  recurring_until?: string;
  project: {
    id: string;
    name: string;
    config?: string;
  };
}

export function useCalendarTasks() {
  const { tasks, projects, loading, error, refetch } = useCalendarTaskContext();

  const optimisticUpdate = useCallback(() => {
    return () => {
      refetch();
    };
  }, [refetch]);

  const optimisticAdd = useCallback(() => {
    return () => {
      refetch();
    };
  }, [refetch]);

  const optimisticRemove = useCallback(() => {
    return () => {
      refetch();
    };
  }, [refetch]);

  const tasksWithProject: TaskWithProject[] = tasks.map((task) => {
    const project = projects.find((p) => p.id === task.project_id);
    return {
      ...task,
      project: {
        id: task.project_id,
        name: project?.name || "Unknown Project",
        config: project?.config ? JSON.stringify(project.config) : undefined,
      },
    };
  });

  const expandedTasks = useMemo(() => {
    return expandTasks(tasksWithProject);
  }, [tasksWithProject]);

  return {
    tasks: expandedTasks,
    projects: projects as Project[],
    loading,
    error,
    refetch,
    optimisticUpdate,
    optimisticAdd,
    optimisticRemove,
  };
}
