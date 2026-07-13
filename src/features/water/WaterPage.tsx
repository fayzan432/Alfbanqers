import { useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Droplets, Trash2, Flame } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/ToastContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { localDateKey, formatTime } from '@/utils/date'
import { displayVolume } from '@/utils/units'
import { useAddWater, useDeleteWater, useWaterEntries, useWaterHistory } from './useWater'
import { format, subDays } from 'date-fns'

const QUICK_AMOUNTS = [200, 300, 500, 750]

export function WaterPage() {
  const { profile } = useProfile()
  const { showToast } = useToast()
  const today = localDateKey()
  const [customAmount, setCustomAmount] = useState('')

  const { data: entries } = useWaterEntries(today)
  const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const { data: history } = useWaterHistory(weekAgo, today)

  const addWater = useAddWater()
  const deleteWater = useDeleteWater()

  const totalToday = useMemo(() => (entries ?? []).reduce((sum, e) => sum + e.amount_ml, 0), [entries])
  const goal = profile?.daily_water_goal_ml ?? 2500
  const units = profile?.unit_system ?? 'metric'

  const chartData = useMemo(() => {
    const days: { date: string; label: string; amount: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const key = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const amount = (history ?? []).filter((e) => e.date === key).reduce((sum, e) => sum + e.amount_ml, 0)
      days.push({ date: key, label: format(subDays(new Date(), i), 'EEE'), amount })
    }
    return days
  }, [history])

  const handleAdd = async (amount: number) => {
    try {
      await addWater.mutateAsync({ amountMl: amount, date: today })
      showToast(`+${amount} ml logged`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to log water.', 'error')
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">Hydration Well</h1>
        <p className="text-sm text-slate-400">Stay hydrated to maintain peak performance.</p>
      </div>

      <Panel className="flex flex-col items-center gap-3 text-center">
        <Droplets className="size-8 text-blue-glow" aria-hidden />
        <p className="font-display text-3xl font-bold text-slate-100">{displayVolume(totalToday, units)}</p>
        <p className="text-xs text-slate-500">of {displayVolume(goal, units)} goal</p>
        <div className="w-full max-w-sm">
          <ProgressBar value={totalToday} max={goal} colorFrom="#3b82f6" colorTo="#22d3ee" showPercent />
        </div>
        <p className="flex items-center gap-1 text-xs text-gold-400">
          <Flame className="size-3.5" /> {profile?.water_streak_current ?? 0} day hydration streak
        </p>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Quick Add</PanelTitle>
        </PanelHeader>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <Button key={amount} variant="secondary" onClick={() => handleAdd(amount)} loading={addWater.isPending}>
              +{amount} ml
            </Button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount (ml)"
            aria-label="Custom water amount in millilitres"
            className="flex-1 rounded-lg border border-white/10 bg-void-800/80 px-3 py-2 text-sm text-slate-100"
          />
          <Button
            disabled={!customAmount || Number(customAmount) <= 0}
            onClick={() => {
              handleAdd(Number(customAmount))
              setCustomAmount('')
            }}
          >
            Add
          </Button>
        </div>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Weekly History</PanelTitle>
        </PanelHeader>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={36} />
              <Tooltip
                contentStyle={{ background: '#16161f', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e5e4f0' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Today's Entries</PanelTitle>
        </PanelHeader>
        {!entries || entries.length === 0 ? (
          <EmptyState icon={Droplets} title="No water logged yet" description="Use the quick-add buttons above." />
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-void-800/50 px-3 py-2">
                <span className="text-sm text-slate-200">{displayVolume(entry.amount_ml, units)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{formatTime(entry.logged_at)}</span>
                  <button
                    onClick={() => deleteWater.mutate(entry.id)}
                    aria-label="Remove entry"
                    className="text-slate-500 hover:text-ember-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
