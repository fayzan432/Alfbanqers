import { useCallback, useEffect, useState } from 'react'

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

export function useNotificationPermission() {
  const supported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState<NotificationPermissionState>(supported ? (Notification.permission as NotificationPermissionState) : 'unsupported')

  useEffect(() => {
    if (supported) setPermission(Notification.permission as NotificationPermissionState)
  }, [supported])

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported' as const
    const result = await Notification.requestPermission()
    setPermission(result as NotificationPermissionState)
    return result
  }, [supported])

  return { permission, requestPermission, supported }
}
