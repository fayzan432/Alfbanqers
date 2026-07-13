import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeChoice = 'dark_fantasy' | 'dark_calm' | 'light'

interface LocalSettings {
  theme: ThemeChoice
  reducedMotion: boolean
  animationsEnabled: boolean
}

interface SettingsContextValue extends LocalSettings {
  setTheme: (theme: ThemeChoice) => void
  setReducedMotion: (value: boolean) => void
  setAnimationsEnabled: (value: boolean) => void
}

const STORAGE_KEY = 'levelup-settings'

function loadInitial(): LocalSettings {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...{ theme: 'dark_fantasy', reducedMotion: prefersReducedMotion, animationsEnabled: true }, ...JSON.parse(raw) }
  } catch {
    /* ignore corrupted storage */
  }
  return { theme: 'dark_fantasy', reducedMotion: prefersReducedMotion, animationsEnabled: true }
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LocalSettings>(loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme === 'light' ? 'light' : 'dark')
    root.classList.toggle('reduce-motion', settings.reducedMotion || !settings.animationsEnabled)
    root.dataset.themeVariant = settings.theme
  }, [settings])

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setReducedMotion: (reducedMotion) => setSettings((s) => ({ ...s, reducedMotion })),
      setAnimationsEnabled: (animationsEnabled) => setSettings((s) => ({ ...s, animationsEnabled })),
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
