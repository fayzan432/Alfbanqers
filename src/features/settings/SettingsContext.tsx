import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { getUserSettings, upsertUserSettings } from '@/services/settingsService'

export type ThemeChoice = 'dark_fantasy' | 'dark_calm' | 'light'

interface LocalSettings {
  theme: ThemeChoice
  reducedMotion: boolean
  animationsEnabled: boolean
  notificationsEnabled: boolean
}

interface SettingsContextValue extends LocalSettings {
  setTheme: (theme: ThemeChoice) => void
  setReducedMotion: (value: boolean) => void
  setAnimationsEnabled: (value: boolean) => void
  setNotificationsEnabled: (value: boolean) => void
}

const STORAGE_KEY = 'levelup-settings'

function loadInitial(): LocalSettings {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const defaults: LocalSettings = {
    theme: 'dark_fantasy',
    reducedMotion: prefersReducedMotion,
    animationsEnabled: true,
    notificationsEnabled: true,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {
    /* ignore corrupted storage */
  }
  return defaults
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<LocalSettings>(loadInitial)
  const loadedForUser = useRef<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme === 'light' ? 'light' : 'dark')
    root.classList.toggle('reduce-motion', settings.reducedMotion || !settings.animationsEnabled)
    root.dataset.themeVariant = settings.theme
  }, [settings])

  useEffect(() => {
    if (!user || loadedForUser.current === user.id) return
    loadedForUser.current = user.id
    getUserSettings(user.id)
      .then((remote) => {
        if (remote) {
          setSettings({
            theme: remote.theme,
            reducedMotion: remote.reduced_motion,
            animationsEnabled: remote.animations_enabled,
            notificationsEnabled: remote.notifications_enabled,
          })
        }
      })
      .catch(() => {
        /* fall back to local settings if the remote fetch fails (e.g. offline) */
      })
  }, [user])

  const persist = (next: LocalSettings) => {
    if (user) {
      upsertUserSettings(user.id, {
        theme: next.theme,
        reduced_motion: next.reducedMotion,
        animations_enabled: next.animationsEnabled,
        notifications_enabled: next.notificationsEnabled,
      }).catch(() => {
        /* offline or transient failure - local state and storage still hold the change */
      })
    }
  }

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme: (theme) => setSettings((s) => { const next = { ...s, theme }; persist(next); return next }),
      setReducedMotion: (reducedMotion) => setSettings((s) => { const next = { ...s, reducedMotion }; persist(next); return next }),
      setAnimationsEnabled: (animationsEnabled) => setSettings((s) => { const next = { ...s, animationsEnabled }; persist(next); return next }),
      setNotificationsEnabled: (notificationsEnabled) => setSettings((s) => { const next = { ...s, notificationsEnabled }; persist(next); return next }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, user],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
