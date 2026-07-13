import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput, TextArea } from '@/components/ui/Input'
import { rewardFormSchema, type RewardFormValues } from './schema'
import type { Reward } from '@/types/database'

interface RewardFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: RewardFormValues) => Promise<void>
  initialReward?: Reward | null
  submitting?: boolean
}

const DEFAULTS: RewardFormValues = {
  name: '',
  description: '',
  coinCost: 50,
  requiredLevel: 1,
  requiredStreak: 0,
  active: true,
}

export function RewardFormModal({ open, onClose, onSubmit, initialReward, submitting }: RewardFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RewardFormValues>({ resolver: zodResolver(rewardFormSchema), defaultValues: DEFAULTS })

  useEffect(() => {
    if (!open) return
    if (initialReward) {
      reset({
        name: initialReward.name,
        description: initialReward.description ?? '',
        coinCost: initialReward.coin_cost,
        requiredLevel: initialReward.required_level,
        requiredStreak: initialReward.required_streak,
        active: initialReward.active,
      })
    } else {
      reset(DEFAULTS)
    }
  }, [open, initialReward, reset])

  return (
    <Modal open={open} onClose={onClose} title={initialReward ? 'Edit Reward' : 'New Reward'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <TextInput id="reward-name" label="Reward name" placeholder="e.g. Watch a movie" error={errors.name?.message} {...register('name')} />
        <TextArea id="reward-description" label="Description (optional)" error={errors.description?.message} {...register('description')} />
        <TextInput
          id="reward-cost"
          type="number"
          label="Coin cost"
          error={errors.coinCost?.message}
          {...register('coinCost', { valueAsNumber: true })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            id="reward-level"
            type="number"
            label="Required level"
            error={errors.requiredLevel?.message}
            {...register('requiredLevel', { valueAsNumber: true })}
          />
          <TextInput
            id="reward-streak"
            type="number"
            label="Required streak (days)"
            error={errors.requiredStreak?.message}
            {...register('requiredStreak', { valueAsNumber: true })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" className="size-4 rounded border-white/20 bg-void-800" {...register('active')} />
          Active (visible for redemption)
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initialReward ? 'Save Changes' : 'Create Reward'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
