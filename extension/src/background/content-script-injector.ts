/**
 * The manifest only statically injects the content script on the known ATS domains (see
 * manifest.json content_scripts). Generic/WordPress/contact-form sites rely on activeTab +
 * on-demand injection instead — that's why the manifest declares no broad host_permissions:
 * activeTab grants access to whichever tab is active for the current user gesture (a popup
 * click or keyboard command both qualify), without a scary install-time permission prompt.
 */
export async function ensureContentScriptInjected(tabId: number): Promise<boolean> {
  const alreadyThere = await chrome.tabs
    .sendMessage(tabId, { type: 'PING' })
    .then(() => true)
    .catch(() => false)
  if (alreadyThere) return true

  const files = chrome.runtime.getManifest().content_scripts?.[0]?.js
  if (!files) return false

  try {
    await chrome.scripting.executeScript({ target: { tabId }, files })
    return true
  } catch {
    // e.g. chrome:// pages, the Chrome Web Store, or other pages scripting can't reach.
    return false
  }
}
