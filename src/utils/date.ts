import { format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'

/** Returns YYYY-MM-DD for the user's local calendar day (never UTC-shifted). */
export function localDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function localDateKeyFromISO(iso: string): string {
  return localDateKey(parseISO(iso))
}

export function isToday(dateKey: string): boolean {
  return dateKey === localDateKey()
}

export function isYesterday(dateKey: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateKey === localDateKey(yesterday)
}

export function daysBetweenKeys(a: string, b: string): number {
  return differenceInCalendarDays(startOfDay(parseISO(b)), startOfDay(parseISO(a)))
}

export function formatDisplayDate(dateKey: string): string {
  return format(parseISO(dateKey), 'MMM d, yyyy')
}

export function formatDisplayDateTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy h:mm a')
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}
