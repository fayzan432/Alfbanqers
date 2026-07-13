import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'

export function AuthLayout({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center overflow-y-auto bg-void-950 px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.12), transparent 40%)',
        }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size="lg" />
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="panel rounded-2xl p-6 shadow-2xl">{children}</div>
      </div>
    </div>
  )
}
