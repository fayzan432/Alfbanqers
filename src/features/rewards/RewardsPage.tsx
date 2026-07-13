import { useState } from 'react'
import { Gift, Plus, Pencil, Trash2, Coins, Lock } from 'lucide-react'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { getLevelProgress } from '@/utils/xp'
import { useCreateReward, useDeleteReward, useRedeemReward, useRewards, useUpdateReward } from './useRewards'
import { RewardFormModal } from './RewardFormModal'
import type { RewardFormValues } from './schema'
import type { Reward } from '@/types/database'

export function RewardsPage() {
  const { profile } = useProfile()
  const { data: rewards, isLoading } = useRewards()
  const { showToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [deletingReward, setDeletingReward] = useState<Reward | null>(null)
  const [redeemingReward, setRedeemingReward] = useState<Reward | null>(null)

  const createReward = useCreateReward()
  const updateReward = useUpdateReward()
  const deleteReward = useDeleteReward()
  const redeemReward = useRedeemReward()

  const level = getLevelProgress(profile?.total_xp ?? 0).level

  const handleSubmit = async (values: RewardFormValues) => {
    const input = {
      name: values.name,
      description: values.description || null,
      coin_cost: values.coinCost,
      required_level: values.requiredLevel,
      required_streak: values.requiredStreak,
      active: values.active,
    }
    try {
      if (editingReward) {
        await updateReward.mutateAsync({ id: editingReward.id, patch: input })
        showToast('Reward updated.', 'success')
      } else {
        await createReward.mutateAsync(input)
        showToast('Reward created.', 'success')
      }
      setFormOpen(false)
      setEditingReward(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save reward.', 'error')
    }
  }

  const handleRedeem = async () => {
    if (!redeemingReward) return
    try {
      await redeemReward.mutateAsync(redeemingReward.id)
      showToast(`Redeemed "${redeemingReward.name}"!`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not redeem reward.', 'error')
    } finally {
      setRedeemingReward(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingReward) return
    try {
      await deleteReward.mutateAsync(deletingReward.id)
      showToast('Reward deleted.', 'success')
    } finally {
      setDeletingReward(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Reward Vault</h1>
          <p className="text-sm text-slate-400">Spend Ascension Coins on rewards you set for yourself.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-sm font-medium text-gold-400">
            <Coins className="size-4" /> {profile?.coins ?? 0}
          </span>
          <Button
            onClick={() => {
              setEditingReward(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" /> New Reward
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Loading rewards..." />
      ) : !rewards || rewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No rewards yet"
          description="Create personal rewards to redeem with your Ascension Coins."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> New Reward
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const canAfford = (profile?.coins ?? 0) >= reward.coin_cost
            const meetsLevel = level >= reward.required_level
            const meetsStreak = (profile?.overall_streak_current ?? 0) >= reward.required_streak
            const eligible = canAfford && meetsLevel && meetsStreak && reward.active

            return (
              <Panel key={reward.id} className={`flex flex-col gap-2 ${!reward.active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-base font-semibold text-slate-100">{reward.name}</h3>
                  <span className="flex items-center gap-1 text-sm font-medium text-gold-400">
                    <Coins className="size-3.5" /> {reward.coin_cost}
                  </span>
                </div>
                {reward.description && <p className="text-xs text-slate-400">{reward.description}</p>}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {reward.required_level > 1 && <span>Level {reward.required_level}+</span>}
                  {reward.required_streak > 0 && <span>{reward.required_streak}+ day streak</span>}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Button size="sm" onClick={() => setRedeemingReward(reward)} disabled={!eligible}>
                    {!canAfford || !meetsLevel || !meetsStreak ? <Lock className="size-3.5" /> : null}
                    Redeem
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingReward(reward); setFormOpen(true) }}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeletingReward(reward)}>
                    <Trash2 className="size-3.5 text-ember-500" />
                  </Button>
                </div>
              </Panel>
            )
          })}
        </div>
      )}

      <RewardFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingReward(null)
        }}
        onSubmit={handleSubmit}
        initialReward={editingReward}
        submitting={createReward.isPending || updateReward.isPending}
      />

      <ConfirmDialog
        open={Boolean(redeemingReward)}
        title="Redeem Reward"
        message={`Spend ${redeemingReward?.coin_cost} coins to redeem "${redeemingReward?.name}"?`}
        confirmLabel="Redeem"
        loading={redeemReward.isPending}
        onConfirm={handleRedeem}
        onCancel={() => setRedeemingReward(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingReward)}
        title="Delete Reward"
        message={`Are you sure you want to delete "${deletingReward?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleteReward.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingReward(null)}
      />
    </div>
  )
}
