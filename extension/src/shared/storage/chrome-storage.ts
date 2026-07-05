/** Typed chrome.storage.local wrapper. Local only — deliberately never .sync (see ARCHITECTURE.md §5). */
export async function storageGet<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key)
  return result[key] as T | undefined
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function storageRemove(key: string): Promise<void> {
  await chrome.storage.local.remove(key)
}

export function onStorageChange<T>(
  key: string,
  callback: (newValue: T | undefined) => void
): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === 'local' && key in changes) {
      callback(changes[key]?.newValue as T | undefined)
    }
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
