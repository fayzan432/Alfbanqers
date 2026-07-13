import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput, Select } from '@/components/ui/Input'
import { calculateBMR, calculateTDEE, suggestCalorieTarget, suggestMacros, ACTIVITY_LEVEL_LABELS, type ActivityLevel, type CalorieGoalType, type Gender } from '@/utils/calories'
import { useProfile } from '@/features/auth/ProfileContext'
import { updateProfile } from '@/services/profileService'
import { useAuth } from '@/features/auth/AuthContext'
import { useToast } from '@/components/ui/ToastContext'

export function CalorieCalculatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, setProfile } = useProfile()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [weight, setWeight] = useState(profile?.current_weight_kg ?? 70)
  const [height, setHeight] = useState(profile?.height_cm ?? 170)
  const [age, setAge] = useState(profile?.age ?? 25)
  const [gender, setGender] = useState<Gender>((profile?.gender as Gender) ?? 'prefer_not_to_say')
  const [activity, setActivity] = useState<ActivityLevel>((profile?.activity_level as ActivityLevel) ?? 'moderate')
  const [goal, setGoal] = useState<CalorieGoalType>('maintain')
  const [applying, setApplying] = useState(false)

  const result = useMemo(() => {
    const bmr = calculateBMR(weight, height, age, gender)
    const tdee = calculateTDEE(bmr, activity)
    const target = suggestCalorieTarget(tdee, goal)
    const macros = suggestMacros(target, weight)
    return { bmr, tdee, target, macros }
  }, [weight, height, age, gender, activity, goal])

  const applyToProfile = async () => {
    if (!user) return
    setApplying(true)
    try {
      const updated = await updateProfile(user.id, {
        daily_calorie_goal: result.target,
        daily_protein_goal: result.macros.proteinG,
        daily_carb_goal: result.macros.carbG,
        daily_fat_goal: result.macros.fatG,
      })
      setProfile(updated)
      showToast('Calorie and macro goals updated.', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update goals.', 'error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Calorie Calculator" size="lg">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextInput id="calc-weight" type="number" label="Weight (kg)" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          <TextInput id="calc-height" type="number" label="Height (cm)" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          <TextInput id="calc-age" type="number" label="Age" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          <Select id="calc-gender" label="Gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </Select>
        </div>
        <Select id="calc-activity" label="Activity level" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
          {Object.entries(ACTIVITY_LEVEL_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <Select id="calc-goal" label="Goal" value={goal} onChange={(e) => setGoal(e.target.value as CalorieGoalType)}>
          <option value="lose">Weight loss</option>
          <option value="maintain">Maintenance</option>
          <option value="gain">Muscle gain</option>
        </Select>

        <div className="rounded-xl border border-arcane-500/30 bg-arcane-500/5 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">BMR</p>
              <p className="font-display text-lg font-bold text-slate-100">{result.bmr}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">TDEE</p>
              <p className="font-display text-lg font-bold text-slate-100">{result.tdee}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Target</p>
              <p className="font-display text-lg font-bold text-arcane-300">{result.target}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Protein / Carbs / Fat</p>
              <p className="font-display text-sm font-bold text-slate-100">
                {result.macros.proteinG}g / {result.macros.carbG}g / {result.macros.fatG}g
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          These figures use the Mifflin-St Jeor formula and are general estimates only — not medical advice. Consult a healthcare
          professional for personalized guidance.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={applyToProfile} loading={applying}>
            Apply to My Goals
          </Button>
        </div>
      </div>
    </Modal>
  )
}
