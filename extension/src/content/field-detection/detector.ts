import { isVisible } from '../../shared/utils/dom-utils'
import type { DetectedField, FieldKind } from '../../shared/types/field.types'

const FIELD_SELECTOR = [
  'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image])',
  'textarea',
  'select',
  '[contenteditable="true"]',
].join(', ')

/**
 * Maps detected field ids back to their live DOM node. Re-populated on every detectFields()
 * call — valid only within the current page session, which is all a content script ever needs
 * (there's no page reload between "detect" and "fill" in the autofill pipeline).
 */
let elementRegistry = new Map<string, Element>()

export function resolveElement(fieldId: string): Element | undefined {
  return elementRegistry.get(fieldId)
}

export function detectFields(root: ParentNode = document): DetectedField[] {
  elementRegistry = new Map()

  const candidates = Array.from(root.querySelectorAll(FIELD_SELECTOR)).filter(isVisible)
  const fields: DetectedField[] = []
  const seenRadioGroups = new Set<string>()
  let counter = 0

  for (const el of candidates) {
    if (!(el instanceof HTMLElement)) continue

    const kind = resolveKind(el)

    if (kind === 'radio') {
      const name = (el as HTMLInputElement).name
      const groupKey = name || el.outerHTML
      if (seenRadioGroups.has(groupKey)) continue
      seenRadioGroups.add(groupKey)

      const group = name
        ? Array.from(document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(name)}"]`))
        : [el as HTMLInputElement]

      const id = `field-${counter++}`
      elementRegistry.set(id, group[0] ?? el)

      fields.push({
        id,
        kind: 'radio',
        label: resolveGroupLabel(el) || resolveLabel(el) || name || 'Choice',
        required: group.some((radio) => radio.required),
        options: group.map((radio) => ({ value: radio.value, label: resolveLabel(radio) || radio.value })),
        currentValue: group.find((radio) => radio.checked)?.value,
        selectorRef: id,
      })
      continue
    }

    const id = `field-${counter++}`
    elementRegistry.set(id, el)

    fields.push({
      id,
      kind,
      label: resolveLabel(el),
      placeholder: (el as HTMLInputElement).placeholder || undefined,
      ariaLabel: el.getAttribute('aria-label') || undefined,
      name: (el as HTMLInputElement).name || undefined,
      required: (el as HTMLInputElement).required || el.getAttribute('aria-required') === 'true',
      options:
        kind === 'select'
          ? Array.from((el as HTMLSelectElement).options).map((o) => ({ value: o.value, label: o.text }))
          : undefined,
      currentValue: resolveCurrentValue(el, kind),
      selectorRef: id,
    })
  }

  return fields
}

function resolveKind(el: HTMLElement): FieldKind {
  const tag = el.tagName.toLowerCase()

  if (tag === 'textarea') return 'textarea'
  if (tag === 'select') return 'select'
  if (el.getAttribute('contenteditable') === 'true') return 'contenteditable'

  if (tag === 'input') {
    switch ((el as HTMLInputElement).type) {
      case 'email':
        return 'email'
      case 'tel':
        return 'phone'
      case 'date':
        return 'date'
      case 'file':
        return 'file'
      case 'checkbox':
        return 'checkbox'
      case 'radio':
        return 'radio'
      default:
        return 'text'
    }
  }

  return 'text'
}

function resolveCurrentValue(el: HTMLElement, kind: FieldKind): string | undefined {
  if (kind === 'checkbox') return String((el as HTMLInputElement).checked)
  if (kind === 'contenteditable') return el.textContent?.trim() || undefined
  return (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value || undefined
}

/** A radio group's question lives on the <fieldset><legend>, not on any one option's own label. */
function resolveGroupLabel(el: HTMLElement): string {
  return el.closest('fieldset')?.querySelector('legend')?.textContent?.trim() || ''
}

/** label[for] -> wrapping <label> -> aria-labelledby -> aria-label -> nearby text -> placeholder. */
function resolveLabel(el: HTMLElement): string {
  const id = el.getAttribute('id')
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`)
    const text = label?.textContent?.trim()
    if (text) return text
  }

  const wrappingLabel = el.closest('label')
  if (wrappingLabel?.textContent?.trim()) return wrappingLabel.textContent.trim()

  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((refId) => document.getElementById(refId)?.textContent?.trim())
      .filter(Boolean)
      .join(' ')
    if (text) return text
  }

  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel?.trim()) return ariaLabel.trim()

  const surrounding = findSurroundingText(el)
  if (surrounding) return surrounding

  return (el as HTMLInputElement).placeholder || ''
}

/** Walks up a few ancestors looking for the nearest preceding non-field text — common on ATS forms
 * that don't wire up <label for> at all (e.g. a <div>Question text</div> right before the input). */
function findSurroundingText(el: HTMLElement): string {
  let node: HTMLElement | null = el

  for (let depth = 0; depth < 4 && node; depth++) {
    let sibling = node.previousElementSibling
    while (sibling) {
      if (!sibling.matches('input, textarea, select, button')) {
        const text = sibling.textContent?.trim()
        if (text && text.length > 0 && text.length < 200) return text
      }
      sibling = sibling.previousElementSibling
    }
    node = node.parentElement
  }

  return ''
}
