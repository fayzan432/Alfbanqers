import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import {
  createReward,
  deleteReward,
  listRedemptions,
  listRewards,
  redeemReward,
  updateReward,
  type RewardInput,
} from '@/services/rewardService'

const REWARDS_KEY = 'rewards'
const REDEMPTIONS_KEY = 'reward_redemptions'

export function useRewards() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [REWARDS_KEY, user?.id],
    queryFn: () => listRewards(user!.id),
    enabled: Boolean(user),
  })
}

export function useRedemptions() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [REDEMPTIONS_KEY, user?.id],
    queryFn: () => listRedemptions(user!.id),
    enabled: Boolean(user),
  })
}

export function useCreateReward() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RewardInput) => createReward(user!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REWARDS_KEY] }),
  })
}

export function useUpdateReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<RewardInput> }) => updateReward(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REWARDS_KEY] }),
  })
}

export function useDeleteReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReward(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [REWARDS_KEY] }),
  })
}

export function useRedeemReward() {
  const queryClient = useQueryClient()
  const { refresh } = useProfile()
  return useMutation({
    mutationFn: (rewardId: string) => redeemReward(rewardId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [REDEMPTIONS_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['activity_history'] }),
        refresh(),
      ])
    },
  })
}
