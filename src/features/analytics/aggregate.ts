import { format, startOfWeek, subDays, subWeeks } from 'date-fns'
import type { Workout, GoalCompletion, FoodEntry, WaterEntry, XpEvent, AttributeEvent } from '@/types/database'
import type { AttributeKey } from '@/utils/attributes'

export interface WeekBucket {
  weekKey: string
  label: string
}

export function lastNWeeks(n: number): WeekBucket[] {
  const buckets: WeekBucket[] = []
  for (let i = n - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
    buckets.push({ weekKey: format(weekStart, 'yyyy-MM-dd'), label: format(weekStart, 'MMM d') })
  }
  return buckets
}

function weekKeyForDate(dateKey: string): string {
  return format(startOfWeek(new Date(`${dateKey}T00:00:00`), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function workoutsPerWeek(workouts: Workout[], weeks = 8) {
  const buckets = lastNWeeks(weeks)
  const counts = new Map(buckets.map((b) => [b.weekKey, { workouts: 0, minutes: 0 }]))
  for (const w of workouts) {
    if (!w.completed) continue
    const key = weekKeyForDate(w.date)
    const bucket = counts.get(key)
    if (bucket) {
      bucket.workouts += 1
      bucket.minutes += w.duration_minutes
    }
  }
  return buckets.map((b) => ({ label: b.label, workouts: counts.get(b.weekKey)!.workouts, minutes: counts.get(b.weekKey)!.minutes }))
}

export function goalsCompletedPerWeek(completions: GoalCompletion[], weeks = 8) {
  const buckets = lastNWeeks(weeks)
  const counts = new Map(buckets.map((b) => [b.weekKey, 0]))
  for (const c of completions) {
    const key = weekKeyForDate(c.completed_at.slice(0, 10))
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return buckets.map((b) => ({ label: b.label, goals: counts.get(b.weekKey) ?? 0 }))
}

function lastNDays(n: number): { dateKey: string; label: string }[] {
  const days: { dateKey: string; label: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = subDays(new Date(), i)
    days.push({ dateKey: format(d, 'yyyy-MM-dd'), label: format(d, 'MMM d') })
  }
  return days
}

export function xpEarnedPerDay(events: XpEvent[], days = 14) {
  const buckets = lastNDays(days)
  const sums = new Map(buckets.map((b) => [b.dateKey, 0]))
  for (const e of events) {
    const key = e.created_at.slice(0, 10)
    if (sums.has(key)) sums.set(key, (sums.get(key) ?? 0) + e.amount)
  }
  return buckets.map((b) => ({ label: b.label, xp: sums.get(b.dateKey) ?? 0 }))
}

export function caloriesPerDay(entries: FoodEntry[], days = 14) {
  const buckets = lastNDays(days)
  const calories = new Map(buckets.map((b) => [b.dateKey, 0]))
  const protein = new Map(buckets.map((b) => [b.dateKey, 0]))
  for (const e of entries) {
    if (calories.has(e.date)) {
      calories.set(e.date, (calories.get(e.date) ?? 0) + Number(e.calories))
      protein.set(e.date, (protein.get(e.date) ?? 0) + Number(e.protein_g))
    }
  }
  return buckets.map((b) => ({ label: b.label, calories: Math.round(calories.get(b.dateKey) ?? 0), protein: Math.round(protein.get(b.dateKey) ?? 0) }))
}

export function waterPerDay(entries: WaterEntry[], days = 14) {
  const buckets = lastNDays(days)
  const sums = new Map(buckets.map((b) => [b.dateKey, 0]))
  for (const e of entries) {
    if (sums.has(e.date)) sums.set(e.date, (sums.get(e.date) ?? 0) + e.amount_ml)
  }
  return buckets.map((b) => ({ label: b.label, waterMl: sums.get(b.dateKey) ?? 0 }))
}

export function attributeProgression(events: AttributeEvent[]) {
  const days = lastNDays(30)
  const running: Record<AttributeKey, number> = { strength: 0, endurance: 0, discipline: 0, agility: 0, consistency: 0 }
  const beforeWindow = events.filter((e) => e.created_at.slice(0, 10) < days[0].dateKey)
  for (const e of beforeWindow) {
    running[e.attribute as AttributeKey] += e.amount
  }

  const eventsByDay = new Map<string, AttributeEvent[]>()
  for (const e of events) {
    const key = e.created_at.slice(0, 10)
    if (key < days[0].dateKey) continue
    const list = eventsByDay.get(key) ?? []
    list.push(e)
    eventsByDay.set(key, list)
  }

  return days.map((d) => {
    for (const e of eventsByDay.get(d.dateKey) ?? []) {
      running[e.attribute as AttributeKey] += e.amount
    }
    return { label: d.label, ...running }
  })
}
