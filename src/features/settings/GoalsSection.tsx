import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Input'
import { goalsFormSchema, type GoalsFormValues } from './schema'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { updateProfile } from '@/services/profileService'
import { useToast } from '@/components/ui/ToastContext'

export function GoalsSection() {
  const { user } = useAuth()
  const { profile, setProfile } = useProfile()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GoalsFormValues>({ resolver: zodResolver(goalsFormSchema) })

  useEffect(() => {
    if (!profile) return
    reset({
      dailyCalorieGoal: profile.daily_calorie_goal,
      dailyProteinGoal: profile.daily_protein_goal,
      dailyCarbGoal: profile.daily_carb_goal,
      dailyFatGoal: profile.daily_fat_goal,
      dailyWaterGoalMl: profile.daily_water_goal_ml,
    })
  }, [profile, reset])

  const onSubmit = async (values: GoalsFormValues) => {
    if (!user) return
    try {
      const updated = await updateProfile(user.id, {
        daily_calorie_goal: values.dailyCalorieGoal,
        daily_protein_goal: values.dailyProteinGoal,
        daily_carb_goal: values.dailyCarbGoal,
        daily_fat_goal: values.dailyFatGoal,
        daily_water_goal_ml: values.dailyWaterGoalMl,
      })
      setProfile(updated)
      showToast('Goals updated.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update goals.', 'error')
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Daily Goals</PanelTitle>
      </PanelHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <TextInput
          id="settings-calorie-goal"
          type="number"
          label="Calorie goal (kcal)"
          error={errors.dailyCalorieGoal?.message}
          {...register('dailyCalorieGoal', { valueAsNumber: true })}
        />
        <div className="grid grid-cols-3 gap-3">
          <TextInput id="settings-protein" type="number" label="Protein (g)" {...register('dailyProteinGoal', { valueAsNumber: true })} />
          <TextInput id="settings-carb" type="number" label="Carbs (g)" {...register('dailyCarbGoal', { valueAsNumber: true })} />
          <TextInput id="settings-fat" type="number" label="Fat (g)" {...register('dailyFatGoal', { valueAsNumber: true })} />
        </div>
        <TextInput
          id="settings-water-goal"
          type="number"
          label="Water goal (ml)"
          error={errors.dailyWaterGoalMl?.message}
          {...register('dailyWaterGoalMl', { valueAsNumber: true })}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={isSubmitting} disabled={!isDirty}>
            Save Goals
          </Button>
        </div>
      </form>
    </Panel>
  )
}
