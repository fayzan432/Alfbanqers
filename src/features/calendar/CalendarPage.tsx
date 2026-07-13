import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday as isTodayFns,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useActivityHistory } from '@/features/history/useHistory'
import { HISTORY_TYPE_META } from '@/features/history/historyMeta'
import { formatDisplayDateTime, localDateKey } from '@/utils/date'

export function CalendarPage() {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthStart = startOfMonth(monthCursor)
  const monthEnd = endOfMonth(monthCursor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const { data: entries } = useActivityHistory({
    from: `${format(gridStart, 'yyyy-MM-dd')}T00:00:00`,
    to: `${format(gridEnd, 'yyyy-MM-dd')}T23:59:59`,
  })

  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof entries>()
    for (const entry of entries ?? []) {
      const key = entry.occurred_at.slice(0, 10)
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
    }
    return map
  }, [entries])

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) ?? [] : []

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Calendar</h1>
          <p className="text-sm text-slate-400">See your quests, workouts, and logs at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setMonthCursor((m) => subMonths(m, 1))} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-32 text-center font-display text-sm font-semibold text-slate-100">{format(monthCursor, 'MMMM yyyy')}</span>
          <Button size="sm" variant="ghost" onClick={() => setMonthCursor((m) => addMonths(m, 1))} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Panel>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEntries = entriesByDate.get(dateKey) ?? []
            const types = [...new Set(dayEntries.map((e) => e.activity_type))].slice(0, 4)
            const inMonth = isSameMonth(day, monthCursor)
            const today = isTodayFns(day)

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={clsx(
                  'flex aspect-square flex-col items-center justify-start gap-1 rounded-lg border p-1.5 text-xs transition-colors',
                  inMonth ? 'border-white/5 bg-void-800/40 text-slate-300' : 'border-transparent text-slate-700',
                  today && 'ring-2 ring-arcane-500',
                  dateKey === selectedDate && 'bg-arcane-500/20',
                )}
              >
                <span>{format(day, 'd')}</span>
                {types.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {types.map((type) => (
                      <span key={type} className="size-1.5 rounded-full" style={{ backgroundColor: HISTORY_TYPE_META[type].color }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Panel>

      <Modal
        open={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        title={selectedDate === localDateKey() ? 'Today' : selectedDate ?? ''}
      >
        {selectedEntries.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No activity logged on this day.</p>
        ) : (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {selectedEntries.map((entry) => {
              const meta = HISTORY_TYPE_META[entry.activity_type]
              const Icon = meta.icon
              return (
                <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-void-800/50 px-3 py-2">
                  <Icon className="size-4 shrink-0" style={{ color: meta.color }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-200">{entry.title}</p>
                    {entry.description && <p className="truncate text-xs text-slate-500">{entry.description}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-600">{formatDisplayDateTime(entry.occurred_at).split(',')[1]}</span>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}
