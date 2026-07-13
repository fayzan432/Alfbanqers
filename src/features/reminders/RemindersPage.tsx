import { useState } from 'react'
import { Bell, BellOff, Plus, Pencil, Trash2 } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { useCreateReminder, useDeleteReminder, useReminders, useUpdateReminder } from './useReminders'
import { ReminderFormModal } from './ReminderFormModal'
import { REMINDER_TYPE_META, REPEAT_PATTERN_LABELS } from './reminderMeta'
import { formatDisplayDate } from '@/utils/date'
import type { ReminderFormValues } from './schema'
import type { Reminder } from '@/types/database'

export function RemindersPage() {
  const { data: reminders, isLoading } = useReminders()
  const { permission, requestPermission, supported } = useNotificationPermission()
  const { showToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null)

  const createReminder = useCreateReminder()
  const updateReminder = useUpdateReminder()
  const deleteReminder = useDeleteReminder()

  const handleSubmit = async (values: ReminderFormValues) => {
    const input = {
      title: values.title,
      message: values.message || null,
      reminder_type: values.reminderType,
      date: values.date,
      time: values.time,
      repeat_pattern: values.repeatPattern,
      enabled: values.enabled,
    }
    try {
      if (editingReminder) {
        await updateReminder.mutateAsync({ id: editingReminder.id, patch: input })
        showToast('Reminder updated.', 'success')
      } else {
        await createReminder.mutateAsync(input)
        showToast('Reminder created.', 'success')
      }
      setFormOpen(false)
      setEditingReminder(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save reminder.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deletingReminder) return
    try {
      await deleteReminder.mutateAsync(deletingReminder.id)
      showToast('Reminder deleted.', 'success')
    } finally {
      setDeletingReminder(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Reminders</h1>
          <p className="text-sm text-slate-400">Stay on track with in-app and browser notifications.</p>
        </div>
        <Button
          onClick={() => {
            setEditingReminder(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> New Reminder
        </Button>
      </div>

      {supported && permission !== 'granted' && (
        <Panel className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <BellOff className="size-4 text-gold-400" />
            Enable browser notifications to get reminders even when this tab isn't focused.
          </div>
          <Button size="sm" variant="secondary" onClick={requestPermission}>
            Enable Notifications
          </Button>
        </Panel>
      )}
      {!supported && (
        <Panel className="text-xs text-slate-500">
          Your browser doesn't support notifications. Reminders will still appear inside the app while it's open.
        </Panel>
      )}
      <p className="text-xs text-slate-600">
        Note: browsers cannot guarantee reminders fire if this app is fully closed. Keep a tab open, or check the dashboard regularly.
      </p>

      {isLoading ? (
        <Spinner label="Loading reminders..." />
      ) : !reminders || reminders.length === 0 ? (
        <EmptyState icon={Bell} title="No reminders yet" description="Create a reminder for a workout, meal, or habit." />
      ) : (
        <div className="flex flex-col gap-2">
          {reminders.map((reminder) => {
            const meta = REMINDER_TYPE_META[reminder.reminder_type]
            const Icon = meta.icon
            return (
              <Panel key={reminder.id} className={`flex items-center gap-3 ${!reminder.enabled ? 'opacity-50' : ''}`}>
                <div className="rounded-lg bg-arcane-500/10 p-2">
                  <Icon className="size-4 text-arcane-400" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{reminder.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDisplayDate(reminder.date)} at {reminder.time.slice(0, 5)} · {REPEAT_PATTERN_LABELS[reminder.repeat_pattern]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingReminder(reminder)
                    setFormOpen(true)
                  }}
                  aria-label="Edit reminder"
                  className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:text-arcane-300"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => setDeletingReminder(reminder)}
                  aria-label="Delete reminder"
                  className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:text-ember-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </Panel>
            )
          })}
        </div>
      )}

      <ReminderFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingReminder(null)
        }}
        onSubmit={handleSubmit}
        initialReminder={editingReminder}
        submitting={createReminder.isPending || updateReminder.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingReminder)}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${deletingReminder?.title}"?`}
        confirmLabel="Delete"
        danger
        loading={deleteReminder.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingReminder(null)}
      />
    </div>
  )
}
