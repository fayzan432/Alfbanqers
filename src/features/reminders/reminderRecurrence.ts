import { parseISO } from 'date-fns'
import { localDateKey, localDateKeyFromISO } from '@/utils/date'
import type { Reminder } from '@/types/database'

/** Whether `reminder` should fire right now, given it hasn't already fired for this occurrence. */
export function isReminderDueNow(reminder: Reminder, now: Date = new Date()): boolean {
  if (!reminder.enabled) return false

  const todayKey = localDateKey(now)
  const [hours, minutes] = reminder.time.split(':').map(Number)
  const scheduledToday = new Date(now)
  scheduledToday.setHours(hours, minutes, 0, 0)

  const alreadyTriggeredToday = reminder.last_triggered_at ? localDateKeyFromISO(reminder.last_triggered_at) === todayKey : false

  if (reminder.repeat_pattern === 'none') {
    if (alreadyTriggeredToday || reminder.last_triggered_at) return false
    const scheduledDateTime = parseISO(`${reminder.date}T${reminder.time}`)
    return now >= scheduledDateTime
  }

  if (alreadyTriggeredToday) return false

  if (reminder.repeat_pattern === 'daily') {
    return now >= scheduledToday
  }

  if (reminder.repeat_pattern === 'weekdays') {
    const day = now.getDay()
    return day >= 1 && day <= 5 && now >= scheduledToday
  }

  if (reminder.repeat_pattern === 'weekly') {
    const originalDay = parseISO(reminder.date).getDay()
    return now.getDay() === originalDay && now >= scheduledToday
  }

  return false
}

export function isUpcomingToday(reminder: Reminder, now: Date = new Date()): boolean {
  if (!reminder.enabled) return false
  const [hours, minutes] = reminder.time.split(':').map(Number)
  const scheduledToday = new Date(now)
  scheduledToday.setHours(hours, minutes, 0, 0)
  if (scheduledToday < now) return false

  if (reminder.repeat_pattern === 'daily') return true
  if (reminder.repeat_pattern === 'weekdays') {
    const day = now.getDay()
    return day >= 1 && day <= 5
  }
  if (reminder.repeat_pattern === 'weekly') {
    return parseISO(reminder.date).getDay() === now.getDay()
  }
  return reminder.date === localDateKey(now)
}
