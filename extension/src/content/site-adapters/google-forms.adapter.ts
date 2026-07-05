import { BaseAdapter } from './base-adapter'
import { isVisible } from '../../shared/utils/dom-utils'
import type { DetectedField, FieldOption } from '../../shared/types/field.types'

interface AriaWidget {
  kind: 'radio' | 'checkbox' | 'select'
  options: { element: HTMLElement; value: string; label: string }[]
}

/**
 * Google Forms renders native <input>/<textarea> for short-answer and paragraph questions
 * (BaseAdapter already catches those), but multiple-choice, checkboxes, and dropdowns are
 * custom ARIA-role widgets with no underlying <input>/<select> at all. Those need a real
 * click simulation, not a value assignment — best-effort based on Google Forms' documented
 * ARIA pattern (role="radio"/"checkbox"/"listbox"/"option"); validate against a live form
 * before relying on this in production, since Google can change the markup without notice.
 */
export class GoogleFormsAdapter extends BaseAdapter {
  readonly id = 'google-forms'

  private widgets = new Map<string, AriaWidget>()

  matches(url: URL): boolean {
    return url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms')
  }

  async detectFields(): Promise<DetectedField[]> {
    const nativeFields = await super.detectFields()
    const widgetFields = this.detectAriaWidgets()
    return [...nativeFields, ...widgetFields]
  }

  async fillField(field: DetectedField, value: string): Promise<boolean> {
    const widget = this.widgets.get(field.selectorRef)
    if (!widget) return super.fillField(field, value)

    if (widget.kind === 'select') {
      const trigger = document.querySelector<HTMLElement>(
        `[role="listbox"][aria-label], [role="listbox"]`
      )
      trigger?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      trigger?.click()
    }

    const option = widget.options.find((o) => o.value === value)
    if (!option) return false

    option.element.click()
    return true
  }

  private detectAriaWidgets(): DetectedField[] {
    this.widgets = new Map()
    const fields: DetectedField[] = []
    let counter = 0

    const groups = Array.from(document.querySelectorAll<HTMLElement>('[role="radiogroup"], [role="listbox"]')).filter(
      isVisible
    )

    for (const group of groups) {
      const isListbox = group.getAttribute('role') === 'listbox'
      const optionEls = Array.from(
        group.querySelectorAll<HTMLElement>(isListbox ? '[role="option"]' : '[role="radio"]')
      ).filter(isVisible)
      if (optionEls.length === 0) continue

      const options: FieldOption[] = optionEls.map((el) => ({
        value: el.getAttribute('data-value') || el.textContent?.trim() || '',
        label: el.textContent?.trim() || '',
      }))

      const id = `gform-${counter++}`
      this.widgets.set(id, {
        kind: isListbox ? 'select' : 'radio',
        options: optionEls.map((el, i) => ({ element: el, value: options[i]!.value, label: options[i]!.label })),
      })

      fields.push({
        id,
        kind: isListbox ? 'select' : 'radio',
        label: group.getAttribute('aria-label') || findQuestionHeading(group) || '',
        required: group.getAttribute('aria-required') === 'true',
        options,
        selectorRef: id,
      })
    }

    // Independent checkboxes (not grouped under a radiogroup/listbox container).
    const checkboxes = Array.from(document.querySelectorAll<HTMLElement>('[role="checkbox"]')).filter(isVisible)
    for (const checkbox of checkboxes) {
      const id = `gform-${counter++}`
      this.widgets.set(id, {
        kind: 'checkbox',
        options: [{ element: checkbox, value: 'true', label: 'checked' }],
      })

      fields.push({
        id,
        kind: 'checkbox',
        label: checkbox.getAttribute('aria-label') || findQuestionHeading(checkbox) || '',
        required: checkbox.getAttribute('aria-required') === 'true',
        currentValue: String(checkbox.getAttribute('aria-checked') === 'true'),
        selectorRef: id,
      })
    }

    return fields
  }
}

function findQuestionHeading(el: HTMLElement): string {
  const container = el.closest('[role="listitem"]')
  const heading = container?.querySelector('[role="heading"]')
  return heading?.textContent?.trim() || ''
}
