import { format } from "date-fns";
import { th, enUS } from "date-fns/locale";

const LOCALE_MAP = { th, en: enUS } as const;

function getDateFnsLocale(locale: string = 'th') {
  return LOCALE_MAP[locale as keyof typeof LOCALE_MAP] || enUS;
}

function parseDate(dateString: string | Date): Date | null {
  try {
    return typeof dateString === 'string' ? new Date(dateString) : dateString;
  } catch {
    return null;
  }
}

function formatDateSafe(
  dateString: string | Date,
  formatStr: string,
  locale?: string
): string {
  const date = parseDate(dateString);
  if (!date) return typeof dateString === 'string' ? dateString : '';

  try {
    return format(date, formatStr, { locale: getDateFnsLocale(locale) });
  } catch {
    return typeof dateString === 'string' ? dateString : '';
  }
}

export function formatDateTime(dateString: string | Date, locale?: string): string {
  return formatDateSafe(dateString, "d MMM yyyy HH:mm", locale);
}

export function formatDate(dateString: string | Date, locale?: string): string {
  return formatDateSafe(dateString, "d MMM yyyy", locale);
}

export function formatTime(dateString: string | Date, locale?: string): string {
  return formatDateSafe(dateString, "HH:mm", locale);
}

export function isValidDate(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidDateRange(startDate: Date | null, endDate: Date | null): boolean {
  if (!startDate || !endDate) return true;
  return endDate > startDate;
}
