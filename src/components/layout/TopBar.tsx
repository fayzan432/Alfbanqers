import { Coins, Flame, LogOut } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useProfile } from '@/features/auth/ProfileContext'
import { signOut } from '@/services/authService'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const { profile } = useProfile()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-void-900/80 px-4 py-3 backdrop-blur lg:px-6">
      <div className="lg:hidden">
        <Logo size="sm" showSubtitle={false} />
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-void-800/70 px-3 py-1.5 text-sm font-medium text-gold-400">
          <Coins className="size-4" aria-hidden />
          {profile?.coins ?? 0}
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-void-800/70 px-3 py-1.5 text-sm font-medium text-arcane-300">
          <Flame className="size-4" aria-hidden />
          {profile?.overall_streak_current ?? 0}
        </div>
        <button
          onClick={handleLogout}
          className="hidden items-center gap-1.5 rounded-full border border-white/5 bg-void-800/70 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-slate-100 sm:flex"
          aria-label="Log out"
        >
          <LogOut className="size-4" aria-hidden />
          Logout
        </button>
      </div>
    </header>
  )
}
