import { useSettings, useUpdateSettings } from '../../shared/hooks/use-settings'
import { QueryState } from '../../shared/components/QueryState'
import type { Settings } from '../../shared/storage/settings-store'

export function SettingsView() {
  const settings = useSettings()
  const updateSettings = useUpdateSettings()

  const toggle = (key: keyof Settings) => {
    if (!settings.data) return
    updateSettings.mutate({ [key]: !settings.data[key] } as Partial<Settings>)
  }

  return (
    <QueryState isLoading={settings.isLoading} error={settings.error}>
      {settings.data && (
        <div className="flex flex-col gap-3 p-4 text-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            Theme
            <select
              value={settings.data.theme}
              onChange={(e) => updateSettings.mutate({ theme: e.target.value as Settings['theme'] })}
              className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
            Language
            <select
              value={settings.data.language}
              onChange={(e) => updateSettings.mutate({ language: e.target.value as Settings['language'] })}
              className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="id">Indonesian</option>
            </select>
          </label>

          <ToggleRow
            label="Auto-fill accepted answers"
            checked={settings.data.autoFill}
            onChange={() => toggle('autoFill')}
          />
          <ToggleRow
            label="Auto-generate on page load"
            checked={settings.data.autoGenerate}
            onChange={() => toggle('autoGenerate')}
          />
          <ToggleRow
            label="Always review before filling"
            checked={settings.data.reviewFirst}
            onChange={() => toggle('reviewFirst')}
          />
        </div>
      )}
    </QueryState>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
    </label>
  )
}
