const TIME_UNITS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 60 * 60 * 24,
  MONTH: 60 * 60 * 24 * 30,
  YEAR: 60 * 60 * 24 * 365,
} as const;

type TimeSuffixes = {
  second: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  year: string;
};

export function getRelativeTimeText(
  date: Date,
  suffixes: TimeSuffixes
): string {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < TIME_UNITS.MINUTE) {
    return `${diffInSeconds}${suffixes.second}`;
  }
  if (diffInSeconds < TIME_UNITS.HOUR) {
    return `${Math.floor(diffInSeconds / TIME_UNITS.MINUTE)}${suffixes.minute}`;
  }
  if (diffInSeconds < TIME_UNITS.DAY) {
    return `${Math.floor(diffInSeconds / TIME_UNITS.HOUR)}${suffixes.hour}`;
  }
  if (diffInSeconds < TIME_UNITS.MONTH) {
    return `${Math.floor(diffInSeconds / TIME_UNITS.DAY)}${suffixes.day}`;
  }
  if (diffInSeconds < TIME_UNITS.YEAR) {
    return `${Math.floor(diffInSeconds / TIME_UNITS.MONTH)}${suffixes.month}`;
  }
  return `${Math.floor(diffInSeconds / TIME_UNITS.YEAR)}${suffixes.year}`;
}
