import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProfileSection } from './ProfileSection'
import { GoalsSection } from './GoalsSection'
import { AppearanceSection } from './AppearanceSection'
import { AboutPrivacySection } from './AboutPrivacySection'
import { DangerZoneSection } from './DangerZoneSection'
import { signOut } from '@/services/authService'

export function SettingsPage() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400">Manage your profile, goals, and app preferences.</p>
        </div>
        <Button size="sm" variant="ghost" onClick={handleLogout}>
          <LogOut className="size-4" /> Log Out
        </Button>
      </div>

      <ProfileSection />
      <GoalsSection />
      <AppearanceSection />
      <AboutPrivacySection />
      <DangerZoneSection />
    </div>
  )
}
