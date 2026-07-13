import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { TextInput, Select } from '@/components/ui/Input'
import { profileFormSchema, type ProfileFormValues } from './schema'
import { ACTIVITY_LEVEL_LABELS } from '@/utils/calories'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { updateProfile } from '@/services/profileService'
import { useToast } from '@/components/ui/ToastContext'

const GOAL_LABELS: Record<ProfileFormValues['mainGoal'], string> = {
  lose_weight: 'Lose weight',
  gain_muscle: 'Gain muscle',
  maintain_weight: 'Maintain weight',
  improve_fitness: 'Improve fitness',
  build_discipline: 'Build discipline',
}

export function ProfileSection() {
  const { user } = useAuth()
  const { profile, setProfile } = useProfile()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema) })

  useEffect(() => {
    if (!profile) return
    reset({
      displayName: profile.display_name,
      age: profile.age ?? undefined,
      heightCm: profile.height_cm ?? undefined,
      currentWeightKg: profile.current_weight_kg ?? undefined,
      targetWeightKg: profile.target_weight_kg ?? undefined,
      activityLevel: profile.activity_level ?? 'moderate',
      mainGoal: profile.main_goal ?? 'improve_fitness',
      unitSystem: profile.unit_system,
    })
  }, [profile, reset])

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return
    try {
      const updated = await updateProfile(user.id, {
        display_name: values.displayName,
        age: values.age ?? null,
        height_cm: values.heightCm ?? null,
        current_weight_kg: values.currentWeightKg ?? null,
        target_weight_kg: values.targetWeightKg ?? null,
        activity_level: values.activityLevel,
        main_goal: values.mainGoal,
        unit_system: values.unitSystem,
      })
      setProfile(updated)
      showToast('Profile updated.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile.', 'error')
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Profile</PanelTitle>
      </PanelHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <TextInput id="settings-name" label="Display name" error={errors.displayName?.message} {...register('displayName')} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput id="settings-age" type="number" label="Age" error={errors.age?.message} {...register('age', { valueAsNumber: true })} />
          <Select id="settings-units" label="Units" error={errors.unitSystem?.message} {...register('unitSystem')}>
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, in)</option>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TextInput id="settings-height" type="number" step="0.1" label="Height (cm)" {...register('heightCm', { valueAsNumber: true })} />
          <TextInput id="settings-weight" type="number" step="0.1" label="Weight (kg)" {...register('currentWeightKg', { valueAsNumber: true })} />
          <TextInput id="settings-target" type="number" step="0.1" label="Target (kg)" {...register('targetWeightKg', { valueAsNumber: true })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select id="settings-activity" label="Activity level" {...register('activityLevel')}>
            {Object.entries(ACTIVITY_LEVEL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select id="settings-goal" label="Main goal" {...register('mainGoal')}>
            {Object.entries(GOAL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={isSubmitting} disabled={!isDirty}>
            Save Profile
          </Button>
        </div>
      </form>
    </Panel>
  )
}
