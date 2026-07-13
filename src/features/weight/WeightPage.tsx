import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Scale, Trash2, Pencil, Plus, Target } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/ToastContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { useAuth } from '@/features/auth/AuthContext'
import { localDateKey, formatDisplayDate } from '@/utils/date'
import { displayWeight, kgToLb, lbToKg } from '@/utils/units'
import { useAddWeightEntry, useDeleteWeightEntry, useUpdateWeightEntry, useWeightEntries } from './useWeight'
import { updateProfile } from '@/services/profileService'
import type { WeightEntry } from '@/types/database'

export function WeightPage() {
  const { user } = useAuth()
  const { profile, setProfile } = useProfile()
  const { showToast } = useToast()
  const units = profile?.unit_system ?? 'metric'

  const { data: entries, isLoading } = useWeightEntries()
  const addEntry = useAddWeightEntry()
  const updateEntry = useUpdateWeightEntry()
  const deleteEntry = useDeleteWeightEntry()

  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null)
  const [weightInput, setWeightInput] = useState('')
  const [dateInput, setDateInput] = useState(localDateKey())
  const [notesInput, setNotesInput] = useState('')
  const [deletingEntry, setDeletingEntry] = useState<WeightEntry | null>(null)
  const [targetInput, setTargetInput] = useState('')
  const [targetModalOpen, setTargetModalOpen] = useState(false)

  const sorted = useMemo(() => [...(entries ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [entries])
  const chartData = sorted.map((e) => ({
    date: e.date,
    label: formatDisplayDate(e.date).slice(0, 6),
    weight: units === 'metric' ? e.weight_kg : Number(kgToLb(e.weight_kg).toFixed(1)),
  }))

  const latest = sorted[sorted.length - 1]
  const first = sorted[0]
  const totalChange = latest && first ? latest.weight_kg - first.weight_kg : 0

  const openCreate = () => {
    setEditingEntry(null)
    setWeightInput('')
    setDateInput(localDateKey())
    setNotesInput('')
    setFormOpen(true)
  }

  const openEdit = (entry: WeightEntry) => {
    setEditingEntry(entry)
    setWeightInput(String(units === 'metric' ? entry.weight_kg : kgToLb(entry.weight_kg).toFixed(1)))
    setDateInput(entry.date)
    setNotesInput(entry.notes ?? '')
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const value = Number(weightInput)
    if (!value || value <= 0) return
    const weightKg = units === 'metric' ? value : lbToKg(value)
    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({ id: editingEntry.id, weightKg, notes: notesInput })
      } else {
        await addEntry.mutateAsync({ weightKg, date: dateInput, notes: notesInput })
      }
      showToast('Weight saved.', 'success')
      setFormOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save weight.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deletingEntry) return
    try {
      await deleteEntry.mutateAsync(deletingEntry.id)
      showToast('Entry deleted.', 'success')
    } finally {
      setDeletingEntry(null)
    }
  }

  const saveTarget = async () => {
    if (!user) return
    const value = Number(targetInput)
    if (!value || value <= 0) return
    const targetKg = units === 'metric' ? value : lbToKg(value)
    try {
      const updated = await updateProfile(user.id, { target_weight_kg: targetKg })
      setProfile(updated)
      showToast('Target weight updated.', 'success')
      setTargetModalOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update target.', 'error')
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Body Chronicle</h1>
          <p className="text-sm text-slate-400">Track your physical transformation over time.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Log Weight
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Panel className="text-center">
          <p className="text-xs text-slate-500">Current</p>
          <p className="font-display text-xl font-bold text-slate-100">{latest ? displayWeight(latest.weight_kg, units) : '—'}</p>
        </Panel>
        <Panel className="text-center">
          <p className="text-xs text-slate-500">Target</p>
          <p className="font-display text-xl font-bold text-arcane-300">
            {profile?.target_weight_kg ? displayWeight(profile.target_weight_kg, units) : '—'}
          </p>
          <button onClick={() => setTargetModalOpen(true)} className="mt-1 text-[11px] text-arcane-400 hover:text-arcane-300">
            Edit
          </button>
        </Panel>
        <Panel className="col-span-2 text-center sm:col-span-2">
          <p className="text-xs text-slate-500">Total Change</p>
          <p className={`font-display text-xl font-bold ${totalChange <= 0 ? 'text-verdant-500' : 'text-gold-400'}`}>
            {totalChange > 0 ? '+' : ''}
            {displayWeight(Math.abs(totalChange), units)}
          </p>
        </Panel>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle>Progress Chart</PanelTitle>
        </PanelHeader>
        {chartData.length < 2 ? (
          <EmptyState icon={Scale} title="Not enough data yet" description="Log at least two entries to see your trend line." />
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={40} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#16161f', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e5e4f0' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>History</PanelTitle>
        </PanelHeader>
        {isLoading ? null : !entries || entries.length === 0 ? (
          <EmptyState icon={Scale} title="No weight entries" description="Add your first entry to start your progress chart." />
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-void-800/50 px-3 py-2">
                <div>
                  <p className="text-sm text-slate-200">{displayWeight(entry.weight_kg, units)}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatDisplayDate(entry.date)}
                    {entry.notes ? ` · ${entry.notes}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(entry)} aria-label="Edit entry" className="text-slate-500 hover:text-arcane-300">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => setDeletingEntry(entry)} aria-label="Delete entry" className="text-slate-500 hover:text-ember-500">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingEntry ? 'Edit Weight Entry' : 'Log Weight'} size="sm">
        <div className="flex flex-col gap-4">
          <TextInput
            id="weight-value"
            type="number"
            step="0.1"
            label={`Weight (${units === 'metric' ? 'kg' : 'lb'})`}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
          />
          {!editingEntry && (
            <TextInput id="weight-date" type="date" label="Date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
          )}
          <TextInput id="weight-notes" label="Notes (optional)" value={notesInput} onChange={(e) => setNotesInput(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={addEntry.isPending || updateEntry.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={targetModalOpen} onClose={() => setTargetModalOpen(false)} title="Set Target Weight" size="sm">
        <div className="flex flex-col gap-4">
          <TextInput
            id="target-weight"
            type="number"
            step="0.1"
            label={`Target weight (${units === 'metric' ? 'kg' : 'lb'})`}
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            hint="This helps track progress on your Player Status page."
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setTargetModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTarget}>
              <Target className="size-4" /> Save Target
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingEntry)}
        title="Delete Entry"
        message="Are you sure you want to delete this weight entry?"
        confirmLabel="Delete"
        danger
        loading={deleteEntry.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingEntry(null)}
      />
    </div>
  )
}
