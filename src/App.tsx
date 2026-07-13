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

import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PlayerStatusPage } from '@/features/player/PlayerStatusPage'
import { GoalsPage } from '@/features/goals/GoalsPage'
import { WorkoutsPage } from '@/features/workouts/WorkoutsPage'
import { NutritionPage } from '@/features/nutrition/NutritionPage'
import { WaterPage } from '@/features/water/WaterPage'
import { WeightPage } from '@/features/weight/WeightPage'
import { AchievementsPage } from '@/features/achievements/AchievementsPage'
import { RewardsPage } from '@/features/rewards/RewardsPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { RemindersPage } from '@/features/reminders/RemindersPage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>
                <ProfileProvider>
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
                        <Route path="/status" element={<PlayerStatusPage />} />
                        <Route path="/goals" element={<GoalsPage />} />
                        <Route path="/workouts" element={<WorkoutsPage />} />
                        <Route path="/nutrition" element={<NutritionPage />} />
                        <Route path="/water" element={<WaterPage />} />
                        <Route path="/weight" element={<WeightPage />} />
                        <Route path="/achievements" element={<AchievementsPage />} />
                        <Route path="/rewards" element={<RewardsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/reminders" element={<RemindersPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ProfileProvider>
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
