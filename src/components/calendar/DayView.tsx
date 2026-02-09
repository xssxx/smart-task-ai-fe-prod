"use client";

import { useMemo, memo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { isToday } from "@/lib/calendar-utils";
import TaskEventCard from "./TaskEventCard";
import type { TaskWithProject } from "@/hooks/useCalendarTasks";
import type { Project } from "@/services/api";

interface DayViewProps {
  currentDate: Date;
  tasks: TaskWithProject[];
  projects: Project[];
  onTaskClick: (task: TaskWithProject) => void;
  onEmptySlotClick: (date: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Helper function to detect overlapping tasks and calculate columns
function calculateTaskLayout(tasks: TaskWithProject[]) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aStart = new Date(a.start_datetime!).getTime();
    const bStart = new Date(b.start_datetime!).getTime();
    return aStart - bStart;
  });

  const columns: TaskWithProject[][] = [];

  sortedTasks.forEach((task) => {
    const taskStart = new Date(task.start_datetime!).getTime();
    const taskEnd = new Date(task.end_datetime!).getTime();

    // Find a column where this task doesn't overlap
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const hasOverlap = column.some((existingTask) => {
        const existingStart = new Date(existingTask.start_datetime!).getTime();
        const existingEnd = new Date(existingTask.end_datetime!).getTime();
        return taskStart < existingEnd && taskEnd > existingStart;
      });

      if (!hasOverlap) {
        column.push(task);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([task]);
    }
  });

  // Create a map of task ID to its column index and total columns
  const layoutMap = new Map<string, { column: number; totalColumns: number }>();
  columns.forEach((column, columnIndex) => {
    column.forEach((task) => {
      layoutMap.set(task.id, {
        column: columnIndex,
        totalColumns: columns.length,
      });
    });
  });

  return layoutMap;
}

function DayView({
  currentDate,
  tasks,
  projects,
  onTaskClick,
  onEmptySlotClick,
}: DayViewProps) {
  // Filter tasks for this day
  const allDayTasks = useMemo(
    () =>
      tasks.filter((task) => {
        // Use occurrence_date if available (from expanded tasks)
        const occurrenceDate = (task as any).occurrence_date;
        if (occurrenceDate) {
          return format(currentDate, "yyyy-MM-dd") === occurrenceDate;
        }
        // Fallback to original logic
        return (
          task.start_datetime &&
          task.end_datetime &&
          isSameDay(parseISO(task.start_datetime), currentDate)
        );
      }),
    [tasks, currentDate]
  );

  const dayTasks = useMemo(() => {
    const seenOriginalIds = new Set<string>();
    return allDayTasks.filter((task) => {
      const originalId = (task as any).original_id || task.id;
      if (seenOriginalIds.has(originalId)) {
        return false; // Skip duplicate
      }
      seenOriginalIds.add(originalId);
      return true;
    });
  }, [allDayTasks]);

  // Calculate layout for overlapping tasks
  const taskLayout = useMemo(() => calculateTaskLayout(dayTasks), [dayTasks]);

  // Get project for a task
  const getProjectForTask = (task: TaskWithProject): Project | undefined => {
    return projects.find((p) => p.id === task.project.id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex divide-x">
        {/* Time margin */}
        <div className="sticky left-0 w-12 bg-background z-10 flex-col">
          {/* Header spacer */}
          <div className="sticky top-0 left-0 h-[33px] bg-background z-20 border-b" />
          {/* Hour labels */}
          <div className="flex flex-col">
            {HOURS.map((hour) => (
              <div key={hour} className="relative h-32 first:mt-0">
                {hour !== 0 && (
                  <span className="absolute text-xs text-muted-foreground -top-2.5 left-2">
                    {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Day content */}
        <div className="flex flex-col flex-1">
          {/* Day header */}
          <div className="sticky top-0 z-10 bg-background border-b h-[33px] flex items-center justify-center">
            <div className="text-sm flex items-center justify-center gap-1">
              <span className="text-muted-foreground">{format(currentDate, "EEE")}</span>
              <span className="text-foreground">{format(currentDate, "d")}</span>
            </div>
          </div>

          {/* Hour grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-32 border-b border-border/50 group cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => onEmptySlotClick(currentDate, hour)}
              />
            ))}

            {/* Tasks overlay */}
            {dayTasks.map((task) => {
              const project = getProjectForTask(task);
              if (!project || !task.start_datetime || !task.end_datetime)
                return null;

              const taskStart = parseISO(task.start_datetime);
              const taskEnd = parseISO(task.end_datetime);

              // Calculate position
              const startHour = taskStart.getHours();
              const startMinute = taskStart.getMinutes();
              const top = startHour * 128 + (startMinute / 60) * 128;

              const endHour = taskEnd.getHours();
              const endMinute = taskEnd.getMinutes();
              const duration =
                endHour * 60 +
                endMinute -
                (startHour * 60 + startMinute);
              const height = Math.max((duration / 60) * 128, 30);

              // Get layout info for overlapping tasks
              const layout = taskLayout.get(task.id);
              const columnWidth = layout ? 100 / layout.totalColumns : 100;
              const leftOffset = layout ? layout.column * columnWidth : 0;

              return (
                <div
                  key={task.id}
                  className="absolute px-1"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${leftOffset}%`,
                    width: `${columnWidth}%`,
                  }}
                >
                  <TaskEventCard
                    task={{
                      id: task.id,
                      name: task.name,
                      description: task.description,
                      priority: task.priority,
                      status: task.status,
                      start_datetime: task.start_datetime,
                      end_datetime: task.end_datetime,
                      location: task.location,
                    }}
                    project={{
                      id: project.id,
                      name: project.name,
                      config: project.config,
                    }}
                    viewMode="day"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pass task with original_id for expanded tasks
                      const taskToPass = {
                        ...task,
                        id: (task as any).original_id || task.id,
                      };
                      onTaskClick(taskToPass);
                    }}
                    className="h-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DayView);
