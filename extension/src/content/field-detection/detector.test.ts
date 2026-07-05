import { describe, it, expect, beforeEach } from 'vitest'
import { detectFields, resolveElement } from './detector'

function setBody(html: string) {
  document.body.innerHTML = html
}

describe('detectFields', () => {
  beforeEach(() => setBody(''))

  it('resolves a label via label[for]', () => {
    setBody(`
      <form>
        <label for="full-name">Full name</label>
        <input type="text" id="full-name" name="full_name" />
      </form>
    `)

    const fields = detectFields(document)
    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({ kind: 'text', label: 'Full name', name: 'full_name', required: false })
  })

  it('resolves a label from a wrapping <label>', () => {
    setBody(`<label>Subscribe <input type="checkbox" id="subscribe" /></label>`)

    const fields = detectFields(document)
    expect(fields[0]).toMatchObject({ kind: 'checkbox', label: 'Subscribe' })
  })

  it('falls back to nearby preceding text when there is no <label> at all', () => {
    setBody(`<div>Why are you reaching out?</div><textarea id="reason"></textarea>`)

    const fields = detectFields(document)
    expect(fields[0]).toMatchObject({ kind: 'textarea', label: 'Why are you reaching out?' })
  })

  it('captures <select> options', () => {
    setBody(`
      <label for="topic">Topic</label>
      <select id="topic">
        <option value="">Choose one</option>
        <option value="sales">Sales</option>
        <option value="support">Support</option>
      </select>
    `)

    const fields = detectFields(document)
    expect(fields[0]?.kind).toBe('select')
    expect(fields[0]?.options).toEqual([
      { value: '', label: 'Choose one' },
      { value: 'sales', label: 'Sales' },
      { value: 'support', label: 'Support' },
    ])
  })

  it('groups a radio button set into a single field, labeled from the fieldset legend', () => {
    setBody(`
      <fieldset>
        <legend>Preferred contact method</legend>
        <label><input type="radio" name="contact_method" value="email" /> Email</label>
        <label><input type="radio" name="contact_method" value="phone" /> Phone</label>
      </fieldset>
    `)

    const fields = detectFields(document)
    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({ kind: 'radio', label: 'Preferred contact method' })
    expect(fields[0]?.options).toEqual([
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
    ])
  })

  it('marks a field required when the required attribute or aria-required is set', () => {
    setBody(`
      <label for="a">A</label><input type="text" id="a" required />
      <label for="b">B</label><input type="text" id="b" aria-required="true" />
      <label for="c">C</label><input type="text" id="c" />
    `)

    const fields = detectFields(document)
    expect(fields.map((f) => f.required)).toEqual([true, true, false])
  })

  it('excludes hidden fields', () => {
    setBody(`
      <label for="visible">Visible</label><input type="text" id="visible" />
      <input type="hidden" id="csrf_token" value="abc" />
      <label for="displayNone">Hidden</label>
      <input type="text" id="displayNone" style="display: none;" />
    `)

    const fields = detectFields(document)
    const labels = fields.map((f) => f.label)
    expect(labels).toContain('Visible')
    expect(labels).not.toContain('Hidden')
    expect(fields.some((f) => f.name === 'csrf_token')).toBe(false)
  })

  it('resolveElement returns the live DOM node for a detected field by id', () => {
    setBody(`<label for="x">X</label><input type="text" id="x" />`)

    const fields = detectFields(document)
    const element = resolveElement(fields[0]!.selectorRef)
    expect(element).toBe(document.getElementById('x'))
  })

  it('resets the element registry on each call so stale ids do not resolve', () => {
    // Two fields in the first pass, one in the second — field-1's id from the first pass
    // must not resolve against the second pass's (smaller) registry. Using an equal field
    // count in both passes would let ids collide by coincidence and mask a stale registry.
    setBody(`<label for="x1">X1</label><input type="text" id="x1" /><label for="x2">X2</label><input type="text" id="x2" />`)
    const firstPass = detectFields(document)

    setBody(`<label for="y">Y</label><input type="text" id="y" />`)
    detectFields(document)

    expect(resolveElement(firstPass[1]!.selectorRef)).toBeUndefined()
  })
})
