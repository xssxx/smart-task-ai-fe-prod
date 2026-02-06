"use client";

import { useMemo, memo } from "react";
import { format, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { getMonthGridDates, isToday } from "@/lib/calendar-utils";
import TaskEventCard from "./TaskEventCard";
import type { TaskWithProject } from "@/hooks/useCalendarTasks";
import type { Project } from "@/services/api";

interface MonthViewProps {
  currentDate: Date;
  tasks: TaskWithProject[];
  projects: Project[];
  onTaskClick: (task: TaskWithProject) => void;
  onEmptySlotClick?: (date: Date) => void;
  onDateClick?: (date: Date) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const MAX_VISIBLE_TASKS = 3;

function MonthView({
  currentDate,
  tasks,
  projects,
  onTaskClick,
  onEmptySlotClick,
  onDateClick,
}: MonthViewProps) {
  const monthGrid = useMemo(() => getMonthGridDates(currentDate), [currentDate]);

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TaskWithProject[]>();

    tasks.forEach((task) => {
      if (!task.end_datetime) return;

      try {
        const endDate = new Date(task.end_datetime);
        const dateKey = format(endDate, "yyyy-MM-dd");

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(task);
      } catch (error) {
        console.error("Invalid date format for task:", task.id, error);
      }
    });

    return grouped;
  }, [tasks]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): TaskWithProject[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return tasksByDate.get(dateKey) || [];
  };

  // Get project for a task
  const getProjectForTask = (task: TaskWithProject): Project | undefined => {
    return projects.find((p) => p.id === task.project.id);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Day names header */}
      <div className="grid grid-cols-7 border-b">
        {DAY_NAMES.map((dayName, index) => (
          <div
            key={dayName}
            className="p-1 sm:p-2 text-center text-xs sm:text-sm font-semibold text-muted-foreground border-r last:border-r-0"
          >
            <span className="hidden sm:inline">{dayName}</span>
            <span className="sm:hidden">{DAY_NAMES_SHORT[index]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn(
        "flex-1 grid border-b last:border-b-0",
        monthGrid.length === 4 && "grid-rows-4",
        monthGrid.length === 5 && "grid-rows-5",
        monthGrid.length === 6 && "grid-rows-6"
      )}>
        {monthGrid.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((date) => {
              const dateTasks = getTasksForDate(date);
              const visibleTasks = dateTasks.slice(0, MAX_VISIBLE_TASKS);
              const remainingCount = dateTasks.length - MAX_VISIBLE_TASKS;
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "min-h-[170px] sm:min-h-[150px] md:min-h-[180px] p-1 sm:p-2 border-r last:border-r-0 flex flex-col gap-0.5 sm:gap-1",
                    "hover:bg-accent/50 transition-all duration-300 cursor-pointer touch-manipulation",
                    !isCurrentMonth && "bg-muted/30"
                  )}
                  onClick={(e) => {
                    // Only trigger date click if clicking the cell itself, not a task
                    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".date-number")) {
                      if (onDateClick) {
                        onDateClick(date);
                      }
                    }
                  }}
                >
                  {/* Date number */}
                  <div
                    className={cn(
                      "date-number w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all duration-300",
                      isTodayDate && "bg-primary text-primary-foreground scale-110",
                      !isTodayDate && isCurrentMonth && "text-foreground hover:bg-accent",
                      !isTodayDate && !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(date, "d")}
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                    {visibleTasks.map((task, index) => {
                      const project = getProjectForTask(task);
                      if (!project) return null;

                      return (
                        <div
                          key={task.id}
                          className="animate-in fade-in slide-in-from-left-2"
                          style={{
                            animationDelay: `${index * 80}ms`,
                            animationDuration: "400ms",
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
                            viewMode="month"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick(task);
                            }}
                          />
                        </div>
                      );
                    })}

                    {/* Show "+N more" indicator */}
                    {remainingCount > 0 && (
                      <div
                        className="text-[10px] sm:text-xs text-muted-foreground px-1 sm:px-1.5 py-0.5 hover:text-foreground transition-colors touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        +{remainingCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(MonthView);
