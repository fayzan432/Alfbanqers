import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { onboardingSchema, type OnboardingFormValues } from './schema'
import { TextInput, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/features/auth/AuthContext'
import { useProfile } from '@/features/auth/ProfileContext'
import { updateProfile } from '@/services/profileService'
import { calculateBMR, calculateTDEE, suggestCalorieTarget, suggestMacros, ACTIVITY_LEVEL_LABELS } from '@/utils/calories'
import { useToast } from '@/components/ui/ToastContext'

const STEP_LABELS = ['Identity', 'Body', 'Lifestyle', 'Daily Targets']

const GOAL_LABELS: Record<OnboardingFormValues['mainGoal'], string> = {
  lose_weight: 'Lose weight',
  gain_muscle: 'Gain muscle',
  maintain_weight: 'Maintain weight',
  improve_fitness: 'Improve fitness',
  build_discipline: 'Build discipline',
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setProfile, refresh } = useProfile()
  const { showToast } = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      unitSystem: 'metric',
      gender: 'prefer_not_to_say',
      activityLevel: 'moderate',
      mainGoal: 'improve_fitness',
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 120,
      dailyCarbGoal: 220,
      dailyFatGoal: 65,
      dailyWaterGoalMl: 2500,
    },
  })

  const values = watch()

  const suggestion = useMemo(() => {
    if (!values.heightCm || !values.currentWeightKg || !values.age) return null
    const bmr = calculateBMR(Number(values.currentWeightKg), Number(values.heightCm), Number(values.age), values.gender)
    const tdee = calculateTDEE(bmr, values.activityLevel)
    const goalType = values.mainGoal === 'lose_weight' ? 'lose' : values.mainGoal === 'gain_muscle' ? 'gain' : 'maintain'
    const target = suggestCalorieTarget(tdee, goalType)
    const macros = suggestMacros(target, Number(values.currentWeightKg))
    return { bmr, tdee, target, macros }
  }, [values.heightCm, values.currentWeightKg, values.age, values.gender, values.activityLevel, values.mainGoal])

  const applySuggestion = () => {
    if (!suggestion) return
    setValue('dailyCalorieGoal', suggestion.target)
    setValue('dailyProteinGoal', suggestion.macros.proteinG)
    setValue('dailyCarbGoal', suggestion.macros.carbG)
    setValue('dailyFatGoal', suggestion.macros.fatG)
  }

  const stepFields: (keyof OnboardingFormValues)[][] = [
    ['displayName', 'age', 'gender'],
    ['unitSystem', 'heightCm', 'currentWeightKg', 'targetWeightKg'],
    ['activityLevel', 'mainGoal'],
    ['dailyCalorieGoal', 'dailyProteinGoal', 'dailyCarbGoal', 'dailyFatGoal', 'dailyWaterGoalMl'],
  ]

  const goNext = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1))
  }
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await updateProfile(user.id, {
        display_name: data.displayName,
        age: data.age,
        gender: data.gender,
        height_cm: data.heightCm,
        current_weight_kg: data.currentWeightKg,
        target_weight_kg: data.targetWeightKg,
        activity_level: data.activityLevel,
        main_goal: data.mainGoal,
        unit_system: data.unitSystem,
        daily_calorie_goal: data.dailyCalorieGoal,
        daily_protein_goal: data.dailyProteinGoal,
        daily_carb_goal: data.dailyCarbGoal,
        daily_fat_goal: data.dailyFatGoal,
        daily_water_goal_ml: data.dailyWaterGoalMl,
        onboarding_completed: true,
      })
      setProfile(updated)
      await refresh()
      showToast('Your journey begins now.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong saving your profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-void-950 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="panel rounded-2xl p-6 shadow-2xl">
          <div className="mb-6 flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1.5 rounded-full ${i <= step ? 'bg-gradient-to-r from-arcane-500 to-cyan-glow' : 'bg-void-700'}`} />
                <p className={`mt-1 text-center text-[11px] ${i === step ? 'text-arcane-300' : 'text-slate-500'}`}>{label}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-lg text-slate-100">Who are you, adventurer?</h2>
                <TextInput id="displayName" label="Display name" error={errors.displayName?.message} {...register('displayName')} />
                <TextInput
                  id="age"
                  type="number"
                  label="Age"
                  error={errors.age?.message}
                  {...register('age', { valueAsNumber: true })}
                />
                <Select id="gender" label="Gender" error={errors.gender?.message} {...register('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </Select>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-lg text-slate-100">Your current form</h2>
                <Select id="unitSystem" label="Measurement units" error={errors.unitSystem?.message} {...register('unitSystem')}>
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lb, in)</option>
                </Select>
                <TextInput
                  id="heightCm"
                  type="number"
                  step="0.1"
                  label={values.unitSystem === 'metric' ? 'Height (cm)' : 'Height (cm equivalent)'}
                  hint="Enter in centimeters; we convert for display later."
                  error={errors.heightCm?.message}
                  {...register('heightCm', { valueAsNumber: true })}
                />
                <TextInput
                  id="currentWeightKg"
                  type="number"
                  step="0.1"
                  label="Current weight (kg)"
                  error={errors.currentWeightKg?.message}
                  {...register('currentWeightKg', { valueAsNumber: true })}
                />
                <TextInput
                  id="targetWeightKg"
                  type="number"
                  step="0.1"
                  label="Target weight (kg)"
                  error={errors.targetWeightKg?.message}
                  {...register('targetWeightKg', { valueAsNumber: true })}
                />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-lg text-slate-100">Your lifestyle</h2>
                <Select id="activityLevel" label="Activity level" error={errors.activityLevel?.message} {...register('activityLevel')}>
                  {Object.entries(ACTIVITY_LEVEL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Select id="mainGoal" label="Main goal" error={errors.mainGoal?.message} {...register('mainGoal')}>
                  {Object.entries(GOAL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-lg text-slate-100">Set your daily targets</h2>
                {suggestion && (
                  <div className="rounded-xl border border-arcane-500/30 bg-arcane-500/5 p-3">
                    <p className="text-xs text-slate-400">
                      Estimated BMR: <span className="text-slate-200">{suggestion.bmr} kcal</span> · Estimated TDEE:{' '}
                      <span className="text-slate-200">{suggestion.tdee} kcal</span> · Suggested target:{' '}
                      <span className="text-slate-200">{suggestion.target} kcal</span>
                    </p>
                    <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={applySuggestion}>
                      <Sparkles className="size-3.5" /> Use suggested targets
                    </Button>
                  </div>
                )}
                <TextInput
                  id="dailyCalorieGoal"
                  type="number"
                  label="Daily calorie goal (kcal)"
                  error={errors.dailyCalorieGoal?.message}
                  {...register('dailyCalorieGoal', { valueAsNumber: true })}
                />
                <div className="grid grid-cols-3 gap-3">
                  <TextInput
                    id="dailyProteinGoal"
                    type="number"
                    label="Protein (g)"
                    error={errors.dailyProteinGoal?.message}
                    {...register('dailyProteinGoal', { valueAsNumber: true })}
                  />
                  <TextInput
                    id="dailyCarbGoal"
                    type="number"
                    label="Carbs (g)"
                    error={errors.dailyCarbGoal?.message}
                    {...register('dailyCarbGoal', { valueAsNumber: true })}
                  />
                  <TextInput
                    id="dailyFatGoal"
                    type="number"
                    label="Fat (g)"
                    error={errors.dailyFatGoal?.message}
                    {...register('dailyFatGoal', { valueAsNumber: true })}
                  />
                </div>
                <TextInput
                  id="dailyWaterGoalMl"
                  type="number"
                  label="Daily water goal (ml)"
                  error={errors.dailyWaterGoalMl?.message}
                  {...register('dailyWaterGoalMl', { valueAsNumber: true })}
                />
                <p className="text-xs text-slate-500">
                  These are general estimates, not medical advice. Consult a healthcare professional for personalized guidance.
                </p>
              </div>
            )}

            {submitError && (
              <p role="alert" className="mt-4 rounded-lg border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-500">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
                <ChevronLeft className="size-4" /> Back
              </Button>
              {step < STEP_LABELS.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" loading={submitting}>
                  Begin Ascension
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
