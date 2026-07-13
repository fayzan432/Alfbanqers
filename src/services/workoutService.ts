import { supabase } from '@/lib/supabase'
import type { ExerciseSet, Workout, WorkoutExercise, WorkoutTemplate, WorkoutType, GoalDifficulty } from '@/types/database'

export interface ExerciseSetInput {
  set_number: number
  reps: number | null
  weight_kg: number | null
  completed: boolean
}

export interface WorkoutExerciseInput {
  exercise_name: string
  muscle_group: string | null
  order_index: number
  rest_seconds: number | null
  notes: string | null
  sets: ExerciseSetInput[]
}

export interface WorkoutInput {
  name: string
  workout_type: WorkoutType
  date: string
  start_time: string | null
  duration_minutes: number
  calories_burned: number | null
  distance_km: number | null
  notes: string | null
  difficulty: GoalDifficulty | null
}

export async function listWorkouts(userId: string, limit = 200): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Workout[]
}

export async function listExercisesForWorkout(workoutId: string): Promise<WorkoutExercise[]> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return (data ?? []) as WorkoutExercise[]
}

export async function listSetsForExercises(exerciseIds: string[]): Promise<ExerciseSet[]> {
  if (exerciseIds.length === 0) return []
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .in('workout_exercise_id', exerciseIds)
    .order('set_number', { ascending: true })
  if (error) throw error
  return (data ?? []) as ExerciseSet[]
}

export async function createWorkoutWithExercises(
  userId: string,
  workout: WorkoutInput,
  exercises: WorkoutExerciseInput[],
): Promise<Workout> {
  const { data: createdWorkout, error: workoutError } = await supabase
    .from('workouts')
    .insert({ user_id: userId, ...workout })
    .select('*')
    .single()
  if (workoutError) throw workoutError

  for (const exercise of exercises) {
    const { data: createdExercise, error: exerciseError } = await supabase
      .from('workout_exercises')
      .insert({
        user_id: userId,
        workout_id: createdWorkout.id,
        exercise_name: exercise.exercise_name,
        muscle_group: exercise.muscle_group,
        order_index: exercise.order_index,
        rest_seconds: exercise.rest_seconds,
        notes: exercise.notes,
      })
      .select('*')
      .single()
    if (exerciseError) throw exerciseError

    if (exercise.sets.length > 0) {
      const { error: setsError } = await supabase.from('exercise_sets').insert(
        exercise.sets.map((set) => ({
          user_id: userId,
          workout_exercise_id: createdExercise.id,
          set_number: set.set_number,
          reps: set.reps,
          weight_kg: set.weight_kg,
          completed: set.completed,
        })),
      )
      if (setsError) throw setsError
    }
  }

  return createdWorkout as Workout
}

export async function updateWorkout(id: string, patch: Partial<WorkoutInput>): Promise<Workout> {
  const { data, error } = await supabase.from('workouts').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as Workout
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) throw error
}

export async function duplicateWorkout(userId: string, workout: Workout, exercises: WorkoutExercise[], setsByExercise: Map<string, ExerciseSet[]>): Promise<Workout> {
  const input: WorkoutInput = {
    name: workout.name,
    workout_type: workout.workout_type,
    date: new Date().toISOString().slice(0, 10),
    start_time: workout.start_time,
    duration_minutes: workout.duration_minutes,
    calories_burned: workout.calories_burned,
    distance_km: workout.distance_km,
    notes: workout.notes,
    difficulty: workout.difficulty,
  }
  const exerciseInputs: WorkoutExerciseInput[] = exercises.map((ex) => ({
    exercise_name: ex.exercise_name,
    muscle_group: ex.muscle_group,
    order_index: ex.order_index,
    rest_seconds: ex.rest_seconds,
    notes: ex.notes,
    sets: (setsByExercise.get(ex.id) ?? []).map((s) => ({ set_number: s.set_number, reps: s.reps, weight_kg: s.weight_kg, completed: false })),
  }))
  return createWorkoutWithExercises(userId, input, exerciseInputs)
}

export interface CompleteWorkoutResult {
  xpAwarded: number
  coinsAwarded: number
  oldLevel: number
  newLevel: number
  leveledUp: boolean
  oldRank: string
  newRank: string
  rankChanged: boolean
  newTotalXp: number
  newCoins: number
}

export async function completeWorkout(workoutId: string, localDateKey: string): Promise<CompleteWorkoutResult> {
  const { data, error } = await supabase.rpc('complete_workout', { p_workout_id: workoutId, p_local_date: localDateKey })
  if (error) throw error
  return data as CompleteWorkoutResult
}

export async function listWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WorkoutTemplate[]
}

export async function createWorkoutTemplate(userId: string, name: string, workoutType: WorkoutType, data: unknown): Promise<WorkoutTemplate> {
  const { data: created, error } = await supabase
    .from('workout_templates')
    .insert({ user_id: userId, name, workout_type: workoutType, data })
    .select('*')
    .single()
  if (error) throw error
  return created as WorkoutTemplate
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('workout_templates').delete().eq('id', id)
  if (error) throw error
}

export interface PersonalRecord {
  exerciseName: string
  maxWeightKg: number
  maxReps: number
}

export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const { data: exercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select('id, exercise_name')
    .eq('user_id', userId)
  if (exercisesError) throw exercisesError
  if (!exercises || exercises.length === 0) return []

  const idsByName = new Map<string, string[]>()
  for (const ex of exercises) {
    const list = idsByName.get(ex.exercise_name) ?? []
    list.push(ex.id)
    idsByName.set(ex.exercise_name, list)
  }

  const allIds = exercises.map((e) => e.id)
  const { data: sets, error: setsError } = await supabase
    .from('exercise_sets')
    .select('workout_exercise_id, weight_kg, reps')
    .in('workout_exercise_id', allIds)
  if (setsError) throw setsError

  const setsByExerciseId = new Map<string, { weight_kg: number | null; reps: number | null }[]>()
  for (const set of sets ?? []) {
    const list = setsByExerciseId.get(set.workout_exercise_id) ?? []
    list.push(set)
    setsByExerciseId.set(set.workout_exercise_id, list)
  }

  const records: PersonalRecord[] = []
  for (const [name, ids] of idsByName.entries()) {
    let maxWeight = 0
    let maxReps = 0
    for (const id of ids) {
      for (const set of setsByExerciseId.get(id) ?? []) {
        if (set.weight_kg && set.weight_kg > maxWeight) maxWeight = set.weight_kg
        if (set.reps && set.reps > maxReps) maxReps = set.reps
      }
    }
    if (maxWeight > 0 || maxReps > 0) {
      records.push({ exerciseName: name, maxWeightKg: maxWeight, maxReps })
    }
  }
  return records.sort((a, b) => b.maxWeightKg - a.maxWeightKg)
}
