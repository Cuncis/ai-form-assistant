import { createRoot } from 'react-dom/client'
import shadowStyles from './shadow.css?inline'
import { Widget } from './Widget'

const HOST_ID = 'ai-form-assistant-root'

/**
 * Mounts the widget in a Shadow DOM root so host-page CSS can never leak in, and our styles
 * (injected here as a raw string, not via manifest content_scripts.css) never leak into the
 * host page either.
 */
export function mountWidget(): void {
  if (document.getElementById(HOST_ID)) return

  const host = document.createElement('div')
  host.id = HOST_ID
  document.body.appendChild(host)

  const shadowRoot = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = shadowStyles
  shadowRoot.appendChild(style)

  const reactContainer = document.createElement('div')
  shadowRoot.appendChild(reactContainer)

  createRoot(reactContainer).render(<Widget />)
}
