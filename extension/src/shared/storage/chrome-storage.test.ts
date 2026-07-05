import { describe, it, expect, beforeEach } from 'vitest'
import { storageGet, storageSet, storageRemove } from './chrome-storage'
import { chromeMock } from '../../test/chrome-mock'

describe('chrome-storage', () => {
  beforeEach(() => {
    chromeMock.storage.local.get.mockReset()
    chromeMock.storage.local.set.mockReset().mockResolvedValue(undefined)
    chromeMock.storage.local.remove.mockReset().mockResolvedValue(undefined)
  })

  it('storageGet unwraps the value for the given key', async () => {
    chromeMock.storage.local.get.mockResolvedValue({ my_key: 'my_value' })

    const result = await storageGet<string>('my_key')

    expect(chromeMock.storage.local.get).toHaveBeenCalledWith('my_key')
    expect(result).toBe('my_value')
  })

  it('storageGet returns undefined for a missing key', async () => {
    chromeMock.storage.local.get.mockResolvedValue({})

    expect(await storageGet('missing')).toBeUndefined()
  })

  it('storageSet writes under the given key', async () => {
    await storageSet('my_key', { nested: true })

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ my_key: { nested: true } })
  })

  it('storageRemove removes the given key', async () => {
    await storageRemove('my_key')

    expect(chromeMock.storage.local.remove).toHaveBeenCalledWith('my_key')
  })
})
