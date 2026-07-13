import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { Logo } from '@/components/Logo'
import { ALL_NAV } from './navConfig'
import { useProfile } from '@/features/auth/ProfileContext'
import { getLevelProgress, getRankForLevel } from '@/utils/xp'
import { RankBadge } from '@/features/player/RankBadge'

export function Sidebar() {
  const { profile } = useProfile()
  const progress = getLevelProgress(profile?.total_xp ?? 0)
  const rank = getRankForLevel(progress.level)

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-white/5 bg-void-900/60 px-4 py-6 lg:flex">
      <Logo size="sm" />

      {profile && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/5 bg-void-800/60 p-3">
          <RankBadge rank={rank} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{profile.display_name}</p>
            <p className="text-xs text-slate-400">
              Level {progress.level} · {rank.label}
            </p>
          </div>
        </div>
      )}

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto" aria-label="Primary navigation">
        {ALL_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-arcane-500/15 text-arcane-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
              )
            }
          >
            <item.icon className="size-[18px] shrink-0" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
