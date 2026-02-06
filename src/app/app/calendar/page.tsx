"use client";

import { useState, useCallback, useMemo } from "react";
import { addHours } from "date-fns";
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
      // For month view, only pre-fill end date
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

  // Calculate tasks count based on current view mode
  const currentViewTaskCount = useMemo(() => {
    if (viewMode === "month") {
      // Month view: count tasks in current month
      return tasks.filter((task) => {
        if (!task.end_datetime) return false;

        try {
          const taskDate = new Date(task.end_datetime);
          return (
            taskDate.getMonth() === currentDate.getMonth() &&
            taskDate.getFullYear() === currentDate.getFullYear()
          );
        } catch {
          return false;
        }
      }).length;
    } else if (viewMode === "week") {
      // Week view: count tasks in current week
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      return tasks.filter((task) => {
        if (!task.start_datetime) return false;

        try {
          const taskDate = new Date(task.start_datetime);
          return taskDate >= weekStart && taskDate < weekEnd;
        } catch {
          return false;
        }
      }).length;
    } else {
      // Day view: count tasks on current day
      return tasks.filter((task) => {
        if (!task.start_datetime) return false;

        try {
          const taskDate = new Date(task.start_datetime);
          return (
            taskDate.getDate() === currentDate.getDate() &&
            taskDate.getMonth() === currentDate.getMonth() &&
            taskDate.getFullYear() === currentDate.getFullYear()
          );
        } catch {
          return false;
        }
      }).length;
    }
  }, [tasks, currentDate, viewMode]);

  const loading = stateLoading || tasksLoading;

  return (
    <CalendarErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50 text-base">
        {/* Main Content */}
        <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto w-full">
          {/* Page Title - Show only on mobile (< 1024px) */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 lg:hidden">
            ปฏิทิน
          </h1>

          {/* Page Subtitle */}
          <div className="mb-4">
            <p className="text-base sm:text-lg text-gray-600">
              ดูและจัดการงานของคุณในมุมมองปฏิทิน
            </p>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-y-auto flex flex-col">
            {/* Show error state if there's an error */}
            {tasksError ? (
              <CalendarErrorState error={tasksError} onRetry={refetch} />
            ) : loading ? (
              /* Show loading skeleton while loading */
              <CalendarSkeleton viewMode={viewMode} />
            ) : (
              /* Show calendar content - always show calendar even with no tasks */
              <div className="flex flex-col h-full">
                {/* Calendar Header */}
                <div className="p-3 sm:p-4 border-b">
                  <CalendarHeader
                    currentDate={currentDate}
                    viewMode={viewMode}
                    taskCount={currentViewTaskCount}
                    onViewModeChange={setViewMode}
                    onNavigate={handleNavigate}
                    onAddEvent={() => setIsCreateDialogOpen(true)}
                  />
                </div>

                {/* Calendar Grid - conditionally render based on view mode */}
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

        {/* Task Detail Dialog */}
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

        {/* Create Task Dialog */}
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
