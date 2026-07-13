import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Select } from '@/components/ui/Input'
import { useSettings } from './SettingsContext'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { Button } from '@/components/ui/Button'

export function AppearanceSection() {
  const { theme, reducedMotion, animationsEnabled, notificationsEnabled, setTheme, setReducedMotion, setAnimationsEnabled, setNotificationsEnabled } =
    useSettings()
  const { permission, requestPermission, supported } = useNotificationPermission()

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Appearance &amp; Notifications</PanelTitle>
      </PanelHeader>
      <div className="flex flex-col gap-4">
        <Select id="settings-theme" label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
          <option value="dark_fantasy">Dark Fantasy (default)</option>
          <option value="dark_calm">Dark - Reduced Glow</option>
          <option value="light">Light</option>
        </Select>

        <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <span>Enable animations</span>
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-void-800"
            checked={animationsEnabled}
            onChange={(e) => setAnimationsEnabled(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <span>Reduced motion</span>
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-void-800"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <span>In-app notifications</span>
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-void-800"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
        </label>

        {supported && permission !== 'granted' && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-void-800/50 px-3 py-2">
            <span className="text-xs text-slate-400">Browser notifications: {permission}</span>
            <Button size="sm" variant="secondary" onClick={requestPermission}>
              Enable
            </Button>
          </div>
        )}
      </div>
    </Panel>
  )
}
