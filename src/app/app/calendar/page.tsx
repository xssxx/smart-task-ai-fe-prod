"use client";

import { useState, useCallback, useMemo } from "react";
import { addHours, format } from "date-fns";
import { useTranslations } from "next-intl";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import TaskDetailDialog from "@/components/calendar/TaskDetailDialog";
import CreateTaskDialog from "@/components/calendar/CreateTaskDialog";
import CalendarSkeleton from "@/components/calendar/CalendarSkeleton";
import CalendarErrorState from "@/components/calendar/CalendarErrorState";
import CalendarErrorBoundary from "@/components/calendar/CalendarErrorBoundary";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useCalendarTasks, TaskWithProject } from "@/hooks/useCalendarTasks";
import { CalendarTaskProvider } from "@/contexts";
import type { Project } from "@/services/api";

function CalendarPageContent() {
  const t = useTranslations();
  const {
    currentDate,
    viewMode,
    loading: stateLoading,
    setViewMode,
    setCurrentDate,
    navigateNext,
    navigatePrev,
    navigateToday,
  } = useCalendarState();

  const { tasks, projects, loading: tasksLoading, error: tasksError, refetch } = useCalendarTasks();

  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDialogDate, setCreateDialogDate] = useState<Date | null>(null);
  const [createDialogStartDate, setCreateDialogStartDate] = useState<Date | null>(null);

  const handleTaskClick = useCallback((task: TaskWithProject) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  }, []);

  const handleEmptySlotClick = useCallback((date: Date, hour?: number) => {
    if (hour !== undefined) {
      const startDate = new Date(date);
      startDate.setHours(hour, 0, 0, 0);
      const endDate = addHours(startDate, 1);

      setCreateDialogStartDate(startDate);
      setCreateDialogDate(endDate);
    } else {
      setCreateDialogStartDate(null);
      setCreateDialogDate(date);
    }

    setIsCreateDialogOpen(true);
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  }, [setCurrentDate, setViewMode]);

  const handleTaskUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTaskDelete = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTaskCreate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleNavigate = useCallback((direction: "prev" | "next" | "today") => {
    if (direction === "prev") {
      navigatePrev();
    } else if (direction === "next") {
      navigateNext();
    } else {
      navigateToday();
    }
  }, [navigatePrev, navigateNext, navigateToday]);

  const handleCloseDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
    setSelectedTask(null);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setCreateDialogDate(null);
    setCreateDialogStartDate(null);
  }, []);

  const currentViewTaskCount = useMemo(() => {
    const deduplicateTasks = (tasksToFilter: typeof tasks) => {
      const seenOriginalIds = new Set<string>();
      return tasksToFilter.filter((task) => {
        const originalId = (task as any).original_id || task.id;
        if (seenOriginalIds.has(originalId)) {
          return false;
        }
        seenOriginalIds.add(originalId);
        return true;
      });
    };

    if (viewMode === "month") {
      const tasksByDate = new Map<string, typeof tasks>();

      tasks.forEach((task) => {
        const occurrenceDate = (task as any).occurrence_date;
        if (!occurrenceDate) return;

        const taskDate = new Date(occurrenceDate);
        if (
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        ) {
          if (!tasksByDate.has(occurrenceDate)) {
            tasksByDate.set(occurrenceDate, []);
          }
          tasksByDate.get(occurrenceDate)!.push(task);
        }
      });

      let totalCount = 0;
      tasksByDate.forEach((dayTasks) => {
        totalCount += deduplicateTasks(dayTasks).length;
      });

      return totalCount;
    } else if (viewMode === "week") {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const tasksByDate = new Map<string, typeof tasks>();

      tasks.forEach((task) => {
        const occurrenceDate = (task as any).occurrence_date;
        if (!occurrenceDate) return;

        const taskDate = new Date(occurrenceDate);
        if (taskDate >= weekStart && taskDate < weekEnd) {
          if (!tasksByDate.has(occurrenceDate)) {
            tasksByDate.set(occurrenceDate, []);
          }
          tasksByDate.get(occurrenceDate)!.push(task);
        }
      });

      let totalCount = 0;
      tasksByDate.forEach((dayTasks) => {
        totalCount += deduplicateTasks(dayTasks).length;
      });

      return totalCount;
    } else {
      const targetDate = format(currentDate, "yyyy-MM-dd");

      const dayTasks = tasks.filter((task) => {
        const occurrenceDate = (task as any).occurrence_date;
        return occurrenceDate === targetDate;
      });

      return deduplicateTasks(dayTasks).length;
    }
  }, [tasks, currentDate, viewMode]);

  const loading = stateLoading || tasksLoading;

  return (
    <CalendarErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background text-base">
        <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto w-full">
          <h1 className="text-3xl font-semibold text-foreground mb-2 lg:hidden">
            {t('calendar.pageTitle')}
          </h1>

          <div className="mb-4">
            <p className="text-base sm:text-lg text-muted-foreground">
              {t('calendar.pageSubtitle')}
            </p>
          </div>

          <div className="flex-1 bg-card rounded-lg border border-border overflow-y-auto flex flex-col">
            {tasksError ? (
              <CalendarErrorState error={tasksError} onRetry={refetch} />
            ) : loading ? (
              <CalendarSkeleton viewMode={viewMode} />
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-3 sm:p-4 border-b border-border">
                  <CalendarHeader
                    currentDate={currentDate}
                    viewMode={viewMode}
                    taskCount={currentViewTaskCount}
                    onViewModeChange={setViewMode}
                    onNavigate={handleNavigate}
                    onAddEvent={() => setIsCreateDialogOpen(true)}
                  />
                </div>

                <div className="flex-1 relative">
                  {viewMode === "month" && (
                    <div
                      key={`month-${currentDate.toISOString()}`}
                      className="animate-in fade-in duration-700 ease-in-out"
                    >
                      <MonthView
                        currentDate={currentDate}
                        tasks={tasks}
                        projects={projects as Project[]}
                        onTaskClick={handleTaskClick}
                        onEmptySlotClick={handleEmptySlotClick}
                        onDateClick={handleDateClick}
                      />
                    </div>
                  )}

                  {viewMode === "week" && (
                    <div
                      key={`week-${currentDate.toISOString()}`}
                      className="animate-in fade-in duration-700 ease-in-out"
                    >
                      <WeekView
                        currentDate={currentDate}
                        tasks={tasks}
                        projects={projects as Project[]}
                        onTaskClick={handleTaskClick}
                        onEmptySlotClick={handleEmptySlotClick}
                      />
                    </div>
                  )}

                  {viewMode === "day" && (
                    <div
                      key={`day-${currentDate.toISOString()}`}
                      className="animate-in fade-in duration-700 ease-in-out"
                    >
                      <DayView
                        currentDate={currentDate}
                        tasks={tasks}
                        projects={projects as Project[]}
                        onTaskClick={handleTaskClick}
                        onEmptySlotClick={handleEmptySlotClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <TaskDetailDialog
          task={
            selectedTask
              ? {
                id: selectedTask.id,
                name: selectedTask.name,
                description: selectedTask.description,
                priority: selectedTask.priority,
                status: selectedTask.status,
                start_datetime: selectedTask.start_datetime,
                end_datetime: selectedTask.end_datetime,
                location: selectedTask.location,
              }
              : null
          }
          project={
            selectedTask
              ? {
                id: selectedTask.project.id,
                name: selectedTask.project.name,
                config: selectedTask.project.config ? JSON.parse(selectedTask.project.config) : undefined,
              }
              : null
          }
          isOpen={isDetailDialogOpen}
          onClose={handleCloseDetailDialog}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />

        <CreateTaskDialog
          isOpen={isCreateDialogOpen}
          prefilledDate={createDialogDate}
          prefilledStartDate={createDialogStartDate}
          projects={projects as Project[]}
          onClose={handleCloseCreateDialog}
          onCreate={handleTaskCreate}
        />
      </div>
    </CalendarErrorBoundary>
  );
}


export default function CalendarPage() {
  return (
    <CalendarTaskProvider>
      <CalendarPageContent />
    </CalendarTaskProvider>
  );
}
