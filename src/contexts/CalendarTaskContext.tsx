"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { listProjects, listTasksByProject, Project, Task as ApiTask } from "@/services/api";

export interface Task {
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
}

interface CalendarTaskContextType {
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchCalendarTasks: (forceRefresh?: boolean) => Promise<void>;
  refetch: () => void;
}

const CalendarTaskContext = createContext<CalendarTaskContextType | undefined>(undefined);

export function CalendarTaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<{
    tasks: Task[];
    projects: Project[];
    timestamp: number;
  } | null>(null);

  const CACHE_DURATION = 30000;

  const fetchCalendarTasks = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh && cacheRef.current) {
        const cacheAge = Date.now() - cacheRef.current.timestamp;
        if (cacheAge < CACHE_DURATION) {
          setTasks(cacheRef.current.tasks);
          setProjects(cacheRef.current.projects);
          setLoading(false);
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);

      const projectsResponse = await listProjects(100, 0);

      if (!projectsResponse.data.success || !projectsResponse.data.data) {
        throw new Error("Failed to fetch projects");
      }

      const projectsList = projectsResponse.data.data.items || [];
      const allTasks: Task[] = [];

      await Promise.all(
        projectsList.map(async (project: Project) => {
          try {
            const tasksResponse = await listTasksByProject(project.id, 100, 0);
            if (tasksResponse.data.success && tasksResponse.data.data) {
              const projectTasks = tasksResponse.data.data.items || [];
              const scheduledTasks = projectTasks
                .filter((task: ApiTask) => task.end_datetime)
                .map((task: ApiTask): Task => ({
                  ...task,
                  project_id: project.id,
                }));
              allTasks.push(...scheduledTasks);
            }
          } catch (err) {
            console.error(`Failed to fetch tasks for project ${project.id}:`, err);
          }
        })
      );

      cacheRef.current = {
        tasks: allTasks,
        projects: projectsList,
        timestamp: Date.now(),
      };

      setTasks(allTasks);
      setProjects(projectsList);
    } catch (err) {
      console.error("Failed to fetch calendar tasks:", err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchCalendarTasks(true);
  }, [fetchCalendarTasks]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  return (
    <CalendarTaskContext.Provider
      value={{ tasks, projects, loading, error, fetchCalendarTasks, refetch }}
    >
      {children}
    </CalendarTaskContext.Provider>
  );
}

export function useCalendarTaskContext() {
  const context = useContext(CalendarTaskContext);
  if (context === undefined) {
    throw new Error("useCalendarTaskContext must be used within a CalendarTaskProvider");
  }
  return context;
}
