import { format } from "date-fns";
import { th } from "date-fns/locale";

/**
 * Format datetime for display in Thai locale
 */
export function formatDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "d MMM yyyy HH:mm", { locale: th });
  } catch {
    return typeof dateString === 'string' ? dateString : '';
  }
}

/**
 * Format date only (without time) in Thai locale
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "d MMM yyyy", { locale: th });
  } catch {
    return typeof dateString === 'string' ? dateString : '';
  }
}

/**
 * Format time only in Thai locale
 */
export function formatTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "HH:mm", { locale: th });
  } catch {
    return '';
  }
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate date range (end must be after start)
 */
export function isValidDateRange(startDate: Date | null, endDate: Date | null): boolean {
  if (!startDate || !endDate) return true;
  return endDate > startDate;
}
