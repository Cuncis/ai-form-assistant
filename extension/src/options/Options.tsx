import { useState, type ReactElement } from 'react'
import { ProfilesManager } from './views/ProfilesManager'
import { TemplatesManager } from './views/TemplatesManager'
import { ApiSettings } from './views/ApiSettings'
import { UsageDashboard } from './views/UsageDashboard'
import { LogsViewer } from './views/LogsViewer'
import { ImportExport } from './views/ImportExport'

const SECTIONS = ['Profiles', 'Templates', 'API Settings', 'Usage', 'Logs', 'Import/Export'] as const
type Section = (typeof SECTIONS)[number]

const SECTION_VIEWS: Record<Section, () => ReactElement> = {
  Profiles: ProfilesManager,
  Templates: TemplatesManager,
  'API Settings': ApiSettings,
  Usage: UsageDashboard,
  Logs: LogsViewer,
  'Import/Export': ImportExport,
}

export function Options() {
  const [activeSection, setActiveSection] = useState<Section>('Profiles')
  const ActiveView = SECTION_VIEWS[activeSection]

  return (
    <div className="flex min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <aside className="w-56 border-r border-gray-200 p-4 dark:border-gray-800">
        <h1 className="mb-4 text-sm font-semibold">AI Form Assistant</h1>
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeSection === section
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <ActiveView />
      </main>
    </div>
  )
}
