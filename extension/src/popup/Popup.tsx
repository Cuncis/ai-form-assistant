import { useState, type ReactElement } from 'react'
import { useAuthStatus, useLogout } from '../shared/hooks/use-auth'
import { LoginView } from './views/LoginView'
import { ProfileView } from './views/ProfileView'
import { TemplatesView } from './views/TemplatesView'
import { GenerateView } from './views/GenerateView'
import { HistoryView } from './views/HistoryView'
import { SettingsView } from './views/SettingsView'
import { UsageView } from './views/UsageView'

const TABS = ['Generate', 'Profile', 'Templates', 'History', 'Usage', 'Settings'] as const
type Tab = (typeof TABS)[number]

const TAB_VIEWS: Record<Tab, () => ReactElement> = {
  Generate: GenerateView,
  Profile: ProfileView,
  Templates: TemplatesView,
  History: HistoryView,
  Usage: UsageView,
  Settings: SettingsView,
}

export function Popup() {
  const [activeTab, setActiveTab] = useState<Tab>('Generate')
  const authStatus = useAuthStatus()
  const logout = useLogout()
  const ActiveView = TAB_VIEWS[activeTab]

  return (
    <div className="w-80 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h1 className="text-sm font-semibold">AI Form Assistant</h1>
        {authStatus.data && (
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="text-xs text-gray-500 hover:underline dark:text-gray-400"
          >
            Sign out
          </button>
        )}
      </header>

      {authStatus.isLoading ? (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
      ) : !authStatus.data ? (
        <LoginView />
      ) : (
        <>
          <nav className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-2 dark:border-gray-800">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <main>
            <ActiveView />
          </main>
        </>
      )}
    </div>
  )
}
