import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { MoreSheet } from './MoreSheet'
import { TopBar } from './TopBar'
import { OfflineBanner } from './OfflineBanner'

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-void-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav onOpenMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}
