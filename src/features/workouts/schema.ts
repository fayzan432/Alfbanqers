import { z } from 'zod'

export const exerciseSetFormSchema = z.object({
  reps: z.number().int().min(0).max(1000).optional(),
  weightKg: z.number().min(0).max(1000).optional(),
})

export const workoutExerciseFormSchema = z.object({
  exerciseName: z.string().trim().min(1, 'Exercise name is required').max(100),
  muscleGroup: z.string().optional(),
  restSeconds: z.number().int().min(0).max(1800).optional(),
  sets: z.array(exerciseSetFormSchema).min(1, 'Add at least one set'),
})

export const workoutFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  workoutType: z.enum(['strength', 'running', 'walking', 'cycling', 'swimming', 'hiit', 'yoga', 'stretching', 'sports', 'custom']),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().optional(),
  durationMinutes: z.number().int().min(0).max(1000),
  caloriesBurned: z.number().min(0).max(10000).optional(),
  distanceKm: z.number().min(0).max(1000).optional(),
  notes: z.string().max(500).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'elite']).optional(),
  exercises: z.array(workoutExerciseFormSchema).optional(),
})

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>
