import { useRef, useState, type ChangeEvent } from 'react'
import { useCreateProfile, useProfiles } from '../../shared/hooks/use-profiles'
import { useCreateTemplate, useTemplates } from '../../shared/hooks/use-templates'

interface ExportBundle {
  profiles: ReturnType<typeof useProfiles>['data']
  templates: ReturnType<typeof useTemplates>['data']
}

export function ImportExport() {
  const profiles = useProfiles()
  const templates = useTemplates()
  const createProfile = useCreateProfile()
  const createTemplate = useCreateTemplate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleExport = () => {
    const bundle: ExportBundle = { profiles: profiles.data, templates: templates.data }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'ai-form-assistant-export.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle
      for (const profile of bundle.profiles ?? []) {
        const { id, createdAt, updatedAt, ...draft } = profile
        void id
        void createdAt
        void updatedAt
        await createProfile.mutateAsync(draft)
      }
      for (const template of bundle.templates ?? []) {
        const { id, isSystem, ...draft } = template
        void id
        void isSystem
        await createTemplate.mutateAsync(draft)
      }
      setStatus(`Imported ${bundle.profiles?.length ?? 0} profile(s) and ${bundle.templates?.length ?? 0} template(s).`)
    } catch {
      setStatus('Import failed — the file was not a valid export bundle.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-md p-6">
      <h2 className="mb-3 text-sm font-semibold">Import / Export</h2>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        Export your profiles and templates as a JSON file, or import a previously exported one.
        Imported items are created as new records via your account, not merged in place.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Import
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
      </div>

      {status && <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{status}</p>}
    </div>
  )
}
