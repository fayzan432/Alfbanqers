import { useState } from 'react'
import { History as HistoryIcon } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Select, TextInput } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useActivityHistory } from './useHistory'
import { HISTORY_TYPE_META } from './historyMeta'
import { formatDisplayDateTime } from '@/utils/date'
import type { ActivityHistoryType } from '@/types/database'

export function HistoryPage() {
  const [type, setType] = useState<ActivityHistoryType | ''>('')
  const [date, setDate] = useState('')

  const { data: entries, isLoading } = useActivityHistory({
    type: type || undefined,
    from: date ? `${date}T00:00:00` : undefined,
    to: date ? `${date}T23:59:59` : undefined,
  })

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">Chronicle of History</h1>
        <p className="text-sm text-slate-400">Every quest, workout, and milestone in your ascension.</p>
      </div>

      <Panel className="flex flex-col gap-3 sm:flex-row">
        <Select id="type-filter" label="Type" value={type} onChange={(e) => setType(e.target.value as ActivityHistoryType | '')}>
          <option value="">All types</option>
          {Object.entries(HISTORY_TYPE_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </Select>
        <TextInput id="date-filter" type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Panel>

      {isLoading ? (
        <Spinner label="Loading history..." />
      ) : !entries || entries.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No history yet" description="Your activity will appear here as you progress." />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => {
            const meta = HISTORY_TYPE_META[entry.activity_type]
            const Icon = meta.icon
            return (
              <Panel key={entry.id} className="flex items-center gap-3 py-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: `${meta.color}1a` }}>
                  <Icon className="size-4" style={{ color: meta.color }} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{entry.title}</p>
                  {entry.description && <p className="truncate text-xs text-slate-400">{entry.description}</p>}
                </div>
                <span className="shrink-0 text-xs text-slate-500">{formatDisplayDateTime(entry.occurred_at)}</span>
              </Panel>
            )
          })}
        </div>
      )}
    </div>
  )
}
