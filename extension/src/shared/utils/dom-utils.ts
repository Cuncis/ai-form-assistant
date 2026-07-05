export function isVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return true
  if (element.hidden) return false

  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

/** Fires the events a React/Vue-controlled input needs to notice a programmatic value change. */
export function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * React (used by Workday, Ashby, LinkedIn's Easy Apply modal) overrides the DOM's own
 * `value`/`checked` setters on the element instance to track state internally. Assigning
 * `element.value = x` directly bypasses that tracked setter — the DOM shows the new value but
 * React never finds out, so the next re-render (or form submit) reverts it. Calling the
 * *native* prototype setter first is the standard workaround.
 */
export function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
  descriptor?.set?.call(element, value)
}

export function setNativeChecked(element: HTMLInputElement, checked: boolean): void {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'checked')
  descriptor?.set?.call(element, checked)
}
