import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div
      className="flex items-center justify-center gap-2 bg-gold-500/90 px-4 py-2 text-center text-xs font-medium text-void-950"
      role="status"
    >
      <WifiOff className="size-3.5" aria-hidden />
      You're offline. Changes will sync once your connection returns.
    </div>
  )
}
