import { extractPageContext } from '../context-extraction/page-context'
import { detectFields as detectFieldsFromDom, resolveElement } from '../field-detection/detector'
import { debounce } from '../../shared/utils/debounce'
import { dispatchInputEvents, setNativeChecked, setNativeValue } from '../../shared/utils/dom-utils'
import type { DetectedField } from '../../shared/types/field.types'
import type { PageContext } from '../../shared/types/generation.types'

export interface SiteAdapter {
  readonly id: string
  matches(url: URL): boolean
  detectFields(): Promise<DetectedField[]>
  onFieldsChanged(callback: (fields: DetectedField[]) => void): () => void
  fillField(field: DetectedField, value: string): Promise<boolean>
  extractContext(): PageContext
}

/**
 * Shared detection/fill/observe plumbing built on native DOM elements — covers LinkedIn,
 * Greenhouse, Lever, Ashby, Workday, WordPress, and the generic fallback, since all of them
 * render real <input>/<textarea>/<select> elements underneath. Google Forms and Typeform
 * override everything because neither uses native form elements at all.
 */
export abstract class BaseAdapter implements SiteAdapter {
  abstract readonly id: string
  abstract matches(url: URL): boolean

  async detectFields(): Promise<DetectedField[]> {
    return detectFieldsFromDom(document)
  }

  onFieldsChanged(callback: (fields: DetectedField[]) => void): () => void {
    const debounced = debounce(() => callback(detectFieldsFromDom(document)), 400)
    const observer = new MutationObserver(debounced)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    })
    return () => observer.disconnect()
  }

  async fillField(field: DetectedField, value: string): Promise<boolean> {
    const element = resolveElement(field.selectorRef)
    if (!element || !(element instanceof HTMLElement)) return false

    switch (field.kind) {
      case 'checkbox':
        setNativeChecked(element as HTMLInputElement, value === 'true')
        dispatchInputEvents(element)
        return true

      case 'radio': {
        const name = (element as HTMLInputElement).name
        const target = name
          ? Array.from(document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(name)}"]`)).find(
              (radio) => radio.value === value
            )
          : (element as HTMLInputElement)
        if (!target) return false
        setNativeChecked(target, true)
        dispatchInputEvents(target)
        return true
      }

      case 'select': {
        const select = element as HTMLSelectElement
        const option = Array.from(select.options).find(
          (o) => o.value === value || o.text.toLowerCase() === value.toLowerCase()
        )
        if (!option) return false
        setNativeValue(select, option.value)
        dispatchInputEvents(select)
        return true
      }

      case 'contenteditable':
        element.textContent = value
        dispatchInputEvents(element)
        return true

      default:
        setNativeValue(element as HTMLInputElement | HTMLTextAreaElement, value)
        dispatchInputEvents(element)
        return true
    }
  }

  extractContext(): PageContext {
    return extractPageContext()
  }
}
