import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('only calls the underlying function once after rapid repeated calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes through the latest arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 50)

    debounced('first')
    debounced('second')
    vi.advanceTimersByTime(50)

    expect(fn).toHaveBeenCalledWith('second')
  })

  it('resets the timer on each call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(60)
    debounced()
    vi.advanceTimersByTime(60)

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(40)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
