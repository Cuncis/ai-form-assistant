import { useState, type FormEvent } from 'react'
import { useSettings, useUpdateSettings } from '../../shared/hooks/use-settings'
import { useAuthStatus, useLogout } from '../../shared/hooks/use-auth'
import { QueryState } from '../../shared/components/QueryState'

export function ApiSettings() {
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const authStatus = useAuthStatus()
  const logout = useLogout()
  const [backendBaseUrl, setBackendBaseUrl] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    updateSettings.mutate({ backendBaseUrl })
  }

  return (
    <QueryState isLoading={settings.isLoading} error={settings.error}>
      {settings.data && (
        <div className="flex max-w-md flex-col gap-6 p-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Backend URL</h2>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder={settings.data.backendBaseUrl}
                defaultValue={settings.data.backendBaseUrl}
                onChange={(e) => setBackendBaseUrl(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </form>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Account</h2>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              {authStatus.data ? 'Signed in.' : 'Not signed in — sign in from the popup.'}
            </p>
            {authStatus.data && (
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </QueryState>
  )
}
