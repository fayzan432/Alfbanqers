import { useEffect, useRef } from 'react'
import { useReminders, useMarkReminderTriggered } from './useReminders'
import { isReminderDueNow } from './reminderRecurrence'
import { useToast } from '@/components/ui/ToastContext'

/** Polls enabled reminders client-side and fires a browser notification (if permitted) plus an in-app toast when due. */
export function ReminderNotifier() {
  const { data: reminders } = useReminders()
  const markTriggered = useMarkReminderTriggered()
  const { showToast } = useToast()
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      for (const reminder of reminders ?? []) {
        if (firedRef.current.has(reminder.id)) continue
        if (!isReminderDueNow(reminder, now)) continue

        firedRef.current.add(reminder.id)
        showToast(`${reminder.title}${reminder.message ? ` — ${reminder.message}` : ''}`, 'info')

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(reminder.title, { body: reminder.message ?? undefined, tag: reminder.id })
          } catch {
            /* some browsers restrict direct Notification construction; the in-app toast still covers it */
          }
        }

        markTriggered.mutate(reminder.id)
      }
    }, 30_000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders])

  return null
}
