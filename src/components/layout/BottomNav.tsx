import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { Menu } from 'lucide-react'
import { PRIMARY_NAV } from './navConfig'

export function BottomNav({ onOpenMore }: { onOpenMore: () => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-void-900/95 backdrop-blur lg:hidden"
      aria-label="Primary navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                  isActive ? 'text-arcane-300' : 'text-slate-500',
                )
              }
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            onClick={onOpenMore}
            className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-500"
            aria-label="More navigation options"
          >
            <Menu className="size-5" aria-hidden />
            More
          </button>
        </li>
      </ul>
    </nav>
  )
}
