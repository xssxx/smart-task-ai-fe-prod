import { addDays, differenceInDays, format, parseISO, startOfDay, isBefore, isAfter, isSameDay } from "date-fns";

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

export interface ExpandedTask extends TaskWithProject {
  original_id: string;
  occurrence_date: string;
  is_recurring: boolean;
  is_multi_day: boolean;
}

export function expandTasks(tasks: TaskWithProject[]): ExpandedTask[] {
  const expandedTasks: ExpandedTask[] = [];

  tasks.forEach((task) => {
    if (!task.end_datetime) return;

    try {
      if (!task.start_datetime) {
        const endDate = parseISO(task.end_datetime);
        expandedTasks.push({
          ...task,
          original_id: task.id,
          occurrence_date: format(endDate, "yyyy-MM-dd"),
          is_recurring: false,
          is_multi_day: false,
        });
        return;
      }

      const startDate = parseISO(task.start_datetime);
      const endDate = parseISO(task.end_datetime);

      const startDay = startOfDay(startDate);
      const endDay = startOfDay(endDate);
      const daysDifference = differenceInDays(endDay, startDay);
      const isMultiDay = daysDifference > 0;

      if (task.recurring_days && task.recurring_days > 0) {
        const maxRecurringDate = addDays(startDate, 365);
        const recurringUntil = task.recurring_until 
          ? parseISO(task.recurring_until) 
          : maxRecurringDate;
        
        const safeRecurringUntil = isBefore(recurringUntil, maxRecurringDate) 
          ? recurringUntil 
          : maxRecurringDate;

        let currentDate = startDate;
        let occurrenceIndex = 0;

        while (isBefore(currentDate, safeRecurringUntil) || isSameDay(currentDate, safeRecurringUntil)) {
          if (isMultiDay) {
            for (let dayOffset = 0; dayOffset <= daysDifference; dayOffset++) {
              const occurrenceDate = addDays(currentDate, dayOffset);
              const occurrenceDateStr = format(occurrenceDate, "yyyy-MM-dd");
              
              const originalStartTime = startDate;
              const originalEndTime = endDate;
              
              const newStartDateTime = addDays(originalStartTime, occurrenceIndex * task.recurring_days);
              const newEndDateTime = addDays(originalEndTime, occurrenceIndex * task.recurring_days);
              
              expandedTasks.push({
                ...task,
                original_id: task.id,
                id: `${task.id}-recurring-${occurrenceIndex}-day-${dayOffset}`,
                occurrence_date: occurrenceDateStr,
                is_recurring: true,
                is_multi_day: true,
                start_datetime: newStartDateTime.toISOString(),
                end_datetime: newEndDateTime.toISOString(),
              });
            }
          } else {
            const occurrenceDateStr = format(currentDate, "yyyy-MM-dd");
            
            const originalStartTime = startDate;
            const originalEndTime = endDate;
            
            const startHours = originalStartTime.getHours();
            const startMinutes = originalStartTime.getMinutes();
            const startSeconds = originalStartTime.getSeconds();
            
            const endHours = originalEndTime.getHours();
            const endMinutes = originalEndTime.getMinutes();
            const endSeconds = originalEndTime.getSeconds();
            
            const newStartDateTime = new Date(currentDate);
            newStartDateTime.setHours(startHours, startMinutes, startSeconds);
            
            const newEndDateTime = new Date(currentDate);
            newEndDateTime.setHours(endHours, endMinutes, endSeconds);
            
            expandedTasks.push({
              ...task,
              original_id: task.id,
              id: `${task.id}-recurring-${occurrenceIndex}`,
              occurrence_date: occurrenceDateStr,
              is_recurring: true,
              is_multi_day: false,
              start_datetime: task.start_datetime ? newStartDateTime.toISOString() : undefined,
              end_datetime: newEndDateTime.toISOString(),
            });
          }

          currentDate = addDays(currentDate, task.recurring_days);
          occurrenceIndex++;

          if (occurrenceIndex > 1000) {
            break;
          }
        }
      } else if (isMultiDay) {
        for (let dayOffset = 0; dayOffset <= daysDifference; dayOffset++) {
          const occurrenceDate = addDays(startDate, dayOffset);
          expandedTasks.push({
            ...task,
            original_id: task.id,
            id: `${task.id}-day-${dayOffset}`,
            occurrence_date: format(occurrenceDate, "yyyy-MM-dd"),
            is_recurring: false,
            is_multi_day: true,
          });
        }
      } else {
        expandedTasks.push({
          ...task,
          original_id: task.id,
          id: task.id,
          occurrence_date: format(endDate, "yyyy-MM-dd"),
          is_recurring: false,
          is_multi_day: false,
        });
      }
    } catch (error) {
      console.error("Error expanding task:", task.id, error);
      expandedTasks.push({
        ...task,
        original_id: task.id,
        occurrence_date: task.end_datetime ? format(parseISO(task.end_datetime), "yyyy-MM-dd") : "",
        is_recurring: false,
        is_multi_day: false,
      });
    }
  });

  return expandedTasks;
}

export function getTasksForDate(expandedTasks: ExpandedTask[], date: Date): ExpandedTask[] {
  const dateKey = format(date, "yyyy-MM-dd");
  return expandedTasks.filter((task) => task.occurrence_date === dateKey);
}

export function getTasksForDateRange(
  expandedTasks: ExpandedTask[],
  startDate: Date,
  endDate: Date
): ExpandedTask[] {
  return expandedTasks.filter((task) => {
    const taskDate = parseISO(task.occurrence_date);
    return (
      (isAfter(taskDate, startDate) || isSameDay(taskDate, startDate)) &&
      (isBefore(taskDate, endDate) || isSameDay(taskDate, endDate))
    );
  });
}
