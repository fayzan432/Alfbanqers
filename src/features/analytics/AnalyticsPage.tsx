import { useMemo } from 'react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Flame, Trophy } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Spinner } from '@/components/ui/Spinner'
import { useProfile } from '@/features/auth/ProfileContext'
import { useGoalCompletions } from '@/features/goals/useGoals'
import { useWorkouts } from '@/features/workouts/useWorkouts'
import { useWeightEntries } from '@/features/weight/useWeight'
import { useAttributeEvents, useFoodHistory, useWaterHistoryRange, useXpEvents } from './useAnalyticsData'
import { attributeProgression, caloriesPerDay, goalsCompletedPerWeek, waterPerDay, workoutsPerWeek, xpEarnedPerDay } from './aggregate'
import { displayWeight } from '@/utils/units'
import { formatDisplayDate } from '@/utils/date'
import { ATTRIBUTE_LABELS } from '@/utils/attributes'

const TOOLTIP_STYLE = { background: '#16161f', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 12 }
const AXIS_PROPS = { stroke: '#64748b', fontSize: 12, tickLine: false, axisLine: false }

const ATTRIBUTE_COLORS: Record<string, string> = {
  strength: '#dc4444',
  endurance: '#0e93b0',
  discipline: '#8b5cf6',
  agility: '#22a35a',
  consistency: '#9a6b0f',
}

export function AnalyticsPage() {
  const { profile } = useProfile()
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts()
  const { data: completions, isLoading: completionsLoading } = useGoalCompletions()
  const { data: weightEntries } = useWeightEntries()
  const { data: xpEvents } = useXpEvents(14)
  const { data: attributeEvents } = useAttributeEvents()
  const { data: foodEntries } = useFoodHistory(14)
  const { data: waterEntries } = useWaterHistoryRange(14)

  const units = profile?.unit_system ?? 'metric'
  const workoutData = useMemo(() => workoutsPerWeek(workouts ?? [], 8), [workouts])
  const goalsData = useMemo(() => goalsCompletedPerWeek(completions ?? [], 8), [completions])
  const xpData = useMemo(() => xpEarnedPerDay(xpEvents ?? [], 14), [xpEvents])
  const calorieData = useMemo(() => caloriesPerDay(foodEntries ?? [], 14), [foodEntries])
  const waterData = useMemo(() => waterPerDay(waterEntries ?? [], 14), [waterEntries])
  const attributeData = useMemo(() => attributeProgression(attributeEvents ?? []), [attributeEvents])

  const sortedWeights = useMemo(() => [...(weightEntries ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [weightEntries])
  const weightChartData = sortedWeights.map((e) => ({ label: formatDisplayDate(e.date).slice(0, 6), weight: e.weight_kg }))
  const totalWeightChange =
    sortedWeights.length >= 2 ? sortedWeights[sortedWeights.length - 1].weight_kg - sortedWeights[0].weight_kg : 0

  const loading = workoutsLoading || completionsLoading

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-400">Your ascension, measured.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Panel className="text-center">
          <Flame className="mx-auto mb-1 size-5 text-gold-400" />
          <p className="font-display text-xl font-bold text-slate-100">{profile?.overall_streak_current ?? 0}</p>
          <p className="text-xs text-slate-500">Current Streak</p>
        </Panel>
        <Panel className="text-center">
          <Trophy className="mx-auto mb-1 size-5 text-gold-400" />
          <p className="font-display text-xl font-bold text-slate-100">{profile?.overall_streak_longest ?? 0}</p>
          <p className="text-xs text-slate-500">Longest Streak</p>
        </Panel>
        <Panel className="text-center">
          <p className="font-display text-xl font-bold text-slate-100">{completions?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Goals Completed</p>
        </Panel>
        <Panel className="text-center">
          <p className={`font-display text-xl font-bold ${totalWeightChange <= 0 ? 'text-verdant-500' : 'text-gold-400'}`}>
            {totalWeightChange > 0 ? '+' : ''}
            {displayWeight(Math.abs(totalWeightChange), units)}
          </p>
          <p className="text-xs text-slate-500">Weight Change</p>
        </Panel>
      </div>

      {loading ? (
        <Spinner label="Loading analytics..." />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel>
            <PanelHeader>
              <PanelTitle>Workouts per Week</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Bar dataKey="workouts" name="Workouts" fill="#0e93b0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Active Minutes per Week</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Bar dataKey="minutes" name="Minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Goals Completed per Week</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Bar dataKey="goals" name="Goals" fill="#22a35a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>XP Earned (14 days)</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Line type="monotone" dataKey="xp" name="XP" stroke="#fbbf24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Calories &amp; Protein (14 days)</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="calories" name="Calories" stroke="#22a35a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="protein" name="Protein (g)" stroke="#dc4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Water Intake (14 days)</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Bar dataKey="waterMl" name="Water (ml)" fill="#0e93b0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Weight Trend</PanelTitle>
            </PanelHeader>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={40} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Line type="monotone" dataKey="weight" name="Weight" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel className="lg:col-span-2">
            <PanelHeader>
              <PanelTitle>Attribute Progression (30 days)</PanelTitle>
            </PanelHeader>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attributeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} width={30} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e4f0' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {Object.keys(ATTRIBUTE_LABELS).map((key) => (
                    <Line key={key} type="monotone" dataKey={key} name={ATTRIBUTE_LABELS[key as keyof typeof ATTRIBUTE_LABELS]} stroke={ATTRIBUTE_COLORS[key]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
