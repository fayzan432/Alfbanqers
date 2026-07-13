import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ui/ToastContext'
import { SettingsProvider } from '@/features/settings/SettingsContext'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ProfileProvider } from '@/features/auth/ProfileContext'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'
import { SkipLink } from '@/components/SkipLink'

import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const PlayerStatusPage = lazy(() => import('@/features/player/PlayerStatusPage').then((m) => ({ default: m.PlayerStatusPage })))
const GoalsPage = lazy(() => import('@/features/goals/GoalsPage').then((m) => ({ default: m.GoalsPage })))
const WorkoutsPage = lazy(() => import('@/features/workouts/WorkoutsPage').then((m) => ({ default: m.WorkoutsPage })))
const NutritionPage = lazy(() => import('@/features/nutrition/NutritionPage').then((m) => ({ default: m.NutritionPage })))
const WaterPage = lazy(() => import('@/features/water/WaterPage').then((m) => ({ default: m.WaterPage })))
const WeightPage = lazy(() => import('@/features/weight/WeightPage').then((m) => ({ default: m.WeightPage })))
const AchievementsPage = lazy(() => import('@/features/achievements/AchievementsPage').then((m) => ({ default: m.AchievementsPage })))
const RewardsPage = lazy(() => import('@/features/rewards/RewardsPage').then((m) => ({ default: m.RewardsPage })))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })))
const RemindersPage = lazy(() => import('@/features/reminders/RemindersPage').then((m) => ({ default: m.RemindersPage })))
const HistoryPage = lazy(() => import('@/features/history/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-[50svh] items-center justify-center">
      <Spinner label="Loading..." />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <SettingsProvider>
                <ProfileProvider>
                  <SkipLink />
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route element={<PublicOnlyRoute />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    </Route>

                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route element={<AppShell />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route
                          path="/status"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <PlayerStatusPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/goals"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <GoalsPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/workouts"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <WorkoutsPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/nutrition"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <NutritionPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/water"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <WaterPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/weight"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <WeightPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/achievements"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <AchievementsPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/rewards"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <RewardsPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/analytics"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <AnalyticsPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/calendar"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <CalendarPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/reminders"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <RemindersPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/history"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <HistoryPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <Suspense fallback={<RouteFallback />}>
                              <SettingsPage />
                            </Suspense>
                          }
                        />
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ProfileProvider>
              </SettingsProvider>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
