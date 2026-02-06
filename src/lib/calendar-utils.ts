import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  isToday as dateFnsIsToday,
  isSameDay as dateFnsIsSameDay,
  addDays,
} from "date-fns";
import { th } from "date-fns/locale";

// Cache for expensive date calculations
const dateRangeCache = new Map<string, { start: Date; end: Date }>();
const monthGridCache = new Map<string, Date[][]>();
const weekDatesCache = new Map<string, Date[]>();

// Cache size limits to prevent memory leaks
const MAX_CACHE_SIZE = 50;

// Helper to manage cache size
function manageCacheSize<T>(cache: Map<string, T>) {
  if (cache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries (first 10)
    const keysToDelete = Array.from(cache.keys()).slice(0, 10);
    keysToDelete.forEach(key => cache.delete(key));
  }
}

export function getMonthDateRange(date: Date): { start: Date; end: Date } {
  const cacheKey = `month-${date.getFullYear()}-${date.getMonth()}`;

  if (dateRangeCache.has(cacheKey)) {
    return dateRangeCache.get(cacheKey)!;
  }

  const result = {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };

  manageCacheSize(dateRangeCache);
  dateRangeCache.set(cacheKey, result);
  return result;
}

export function getWeekDateRange(date: Date): { start: Date; end: Date } {
  const cacheKey = `week-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  if (dateRangeCache.has(cacheKey)) {
    return dateRangeCache.get(cacheKey)!;
  }

  const result = {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  };

  manageCacheSize(dateRangeCache);
  dateRangeCache.set(cacheKey, result);
  return result;
}

export function getDayDateRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

export function getMonthGridDates(date: Date): Date[][] {
  const cacheKey = `grid-${date.getFullYear()}-${date.getMonth()}`;

  if (monthGridCache.has(cacheKey)) {
    return monthGridCache.get(cacheKey)!;
  }

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Get the start of the week containing the first day of the month
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  // Get the end of the week containing the last day of the month
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Get all dates in the range
  const allDates = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Group dates into weeks (7 days per week)
  const weeks: Date[][] = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }

  manageCacheSize(monthGridCache);
  monthGridCache.set(cacheKey, weeks);
  return weeks;
}

export function getWeekDates(date: Date): Date[] {
  const cacheKey = `weekdates-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  if (weekDatesCache.has(cacheKey)) {
    return weekDatesCache.get(cacheKey)!;
  }

  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const dates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(weekStart, i));
  }

  manageCacheSize(weekDatesCache);
  weekDatesCache.set(cacheKey, dates);
  return dates;
}

/**
 * Format a date range for display based on view mode
 * @param start - Start date of the range
 * @param end - End date of the range
 * @param viewMode - Current calendar view mode
 * @returns Formatted date range string in Thai format
 */
export function formatDateRange(
  start: Date,
  end: Date,
  viewMode: "month" | "week" | "day"
): string {
  switch (viewMode) {
    case "month":
      return format(start, "MMMM yyyy", { locale: th });

    case "week":
      const startFormatted = format(start, "EEEE, d MMMM", { locale: th });
      const endFormatted = format(end, "EEEE, d MMMM yyyy", { locale: th });
      return `${startFormatted} - ${endFormatted}`;

    case "day":
      return format(start, "EEEE, d MMMM yyyy", { locale: th });

    default:
      return format(start, "EEEE, d MMMM yyyy", { locale: th });
  }
}

export function isToday(date: Date): boolean {
  return dateFnsIsToday(date);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return dateFnsIsSameDay(date1, date2);
}
