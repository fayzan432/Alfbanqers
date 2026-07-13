export type AttributeKey = 'strength' | 'endurance' | 'discipline' | 'agility' | 'consistency'

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  strength: 'Strength',
  endurance: 'Endurance',
  discipline: 'Discipline',
  agility: 'Agility',
  consistency: 'Consistency',
}

const ENDURANCE_WORKOUT_TYPES = new Set(['running', 'walking', 'cycling', 'swimming', 'hiit'])
const AGILITY_WORKOUT_TYPES = new Set(['hiit', 'yoga', 'stretching', 'sports'])

/** Attribute points awarded for completing a workout of the given type/duration. */
export function attributesForWorkout(workoutType: string, durationMinutes: number): Partial<Record<AttributeKey, number>> {
  const gains: Partial<Record<AttributeKey, number>> = {}
  const magnitude = Math.max(1, Math.round(durationMinutes / 15))

  if (workoutType === 'strength') gains.strength = (gains.strength ?? 0) + magnitude * 2
  if (ENDURANCE_WORKOUT_TYPES.has(workoutType)) gains.endurance = (gains.endurance ?? 0) + magnitude * 2
  if (AGILITY_WORKOUT_TYPES.has(workoutType)) gains.agility = (gains.agility ?? 0) + magnitude

  gains.discipline = (gains.discipline ?? 0) + 1
  return gains
}

/** Attribute points awarded for completing a goal. */
export function attributesForGoalCompletion(category: string): Partial<Record<AttributeKey, number>> {
  const gains: Partial<Record<AttributeKey, number>> = { discipline: 2 }
  if (category === 'workout') gains.strength = 1
  return gains
}

export function attributesForStreakMilestone(): Partial<Record<AttributeKey, number>> {
  return { consistency: 5 }
}
