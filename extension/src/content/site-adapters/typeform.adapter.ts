import { BaseAdapter } from './base-adapter'
import { isVisible } from '../../shared/utils/dom-utils'
import type { DetectedField, FieldOption } from '../../shared/types/field.types'

/**
 * Typeform shows one question at a time and uses real <input>/[contenteditable] for text
 * answers (BaseAdapter's native detection already covers those). Choice-type questions are
 * custom button/list widgets with no stable public contract the way Google's ARIA roles are —
 * this is a lower-confidence best-effort based on commonly observed markup (role="radio" /
 * data-qa="choice-option" patterns in current Typeform embeds). Validate against a live
 * typeform before relying on this; it's the most likely of all nine adapters to need a fix
 * once tested against the real site.
 */
export class TypeformAdapter extends BaseAdapter {
  readonly id = 'typeform'

  private choiceGroups = new Map<string, { element: HTMLElement; value: string }[]>()

  matches(url: URL): boolean {
    return url.hostname.endsWith('typeform.com') && url.pathname.startsWith('/to')
  }

  async detectFields(): Promise<DetectedField[]> {
    const nativeFields = await super.detectFields()
    const choiceFields = this.detectVisibleChoiceQuestion()
    return [...nativeFields, ...choiceFields]
  }

  async fillField(field: DetectedField, value: string): Promise<boolean> {
    const group = this.choiceGroups.get(field.selectorRef)
    if (!group) return super.fillField(field, value)

    const option = group.find((o) => o.value === value)
    if (!option) return false

    option.element.click()
    return true
  }

  private detectVisibleChoiceQuestion(): DetectedField[] {
    this.choiceGroups = new Map()

    const choiceEls = Array.from(
      document.querySelectorAll<HTMLElement>('[role="radio"], [data-qa="choice-option"], [data-qa="option"]')
    ).filter(isVisible)

    if (choiceEls.length === 0) return []

    const options: FieldOption[] = choiceEls.map((el) => ({
      value: el.getAttribute('data-value') || el.textContent?.trim() || '',
      label: el.textContent?.trim() || '',
    }))

    const id = 'typeform-choice-0'
    this.choiceGroups.set(
      id,
      choiceEls.map((el, i) => ({ element: el, value: options[i]!.value }))
    )

    const heading = document.querySelector('[data-qa="question-title"], h1, [role="heading"]')

    return [
      {
        id,
        kind: 'radio',
        label: heading?.textContent?.trim() || '',
        required: false,
        options,
        selectorRef: id,
      },
    ]
  }
}
