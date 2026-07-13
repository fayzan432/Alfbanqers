import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput, Select, TextArea } from '@/components/ui/Input'
import { reminderFormSchema, type ReminderFormValues } from './schema'
import { REMINDER_TYPE_META, REPEAT_PATTERN_LABELS } from './reminderMeta'
import { localDateKey } from '@/utils/date'
import type { Reminder } from '@/types/database'

interface ReminderFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ReminderFormValues) => Promise<void>
  initialReminder?: Reminder | null
  submitting?: boolean
}

const DEFAULTS: ReminderFormValues = {
  title: '',
  message: '',
  reminderType: 'custom',
  date: localDateKey(),
  time: '09:00',
  repeatPattern: 'none',
  enabled: true,
}

export function ReminderFormModal({ open, onClose, onSubmit, initialReminder, submitting }: ReminderFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({ resolver: zodResolver(reminderFormSchema), defaultValues: DEFAULTS })

  useEffect(() => {
    if (!open) return
    if (initialReminder) {
      reset({
        title: initialReminder.title,
        message: initialReminder.message ?? '',
        reminderType: initialReminder.reminder_type,
        date: initialReminder.date,
        time: initialReminder.time.slice(0, 5),
        repeatPattern: initialReminder.repeat_pattern,
        enabled: initialReminder.enabled,
      })
    } else {
      reset(DEFAULTS)
    }
  }, [open, initialReminder, reset])

  return (
    <Modal open={open} onClose={onClose} title={initialReminder ? 'Edit Reminder' : 'New Reminder'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <TextInput id="reminder-title" label="Title" error={errors.title?.message} {...register('title')} />
        <TextArea id="reminder-message" label="Message (optional)" error={errors.message?.message} {...register('message')} />
        <Select id="reminder-type" label="Type" error={errors.reminderType?.message} {...register('reminderType')}>
          {Object.entries(REMINDER_TYPE_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <TextInput id="reminder-date" type="date" label="Date" error={errors.date?.message} {...register('date')} />
          <TextInput id="reminder-time" type="time" label="Time" error={errors.time?.message} {...register('time')} />
        </div>
        <Select id="reminder-repeat" label="Repeat" error={errors.repeatPattern?.message} {...register('repeatPattern')}>
          {Object.entries(REPEAT_PATTERN_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" className="size-4 rounded border-white/20 bg-void-800" {...register('enabled')} />
          Enabled
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initialReminder ? 'Save Changes' : 'Create Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
