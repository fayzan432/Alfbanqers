import { NavLink } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { SECONDARY_NAV } from './navConfig'

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="More">
      <div className="grid grid-cols-3 gap-3">
        {SECONDARY_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-void-800/60 p-3 text-center text-xs font-medium text-slate-300 hover:border-arcane-500/30 hover:text-arcane-300"
          >
            <item.icon className="size-5" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </div>
    </Modal>
  )
}
