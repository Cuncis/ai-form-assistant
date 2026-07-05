import { BaseAdapter } from './base-adapter'

export class GreenhouseAdapter extends BaseAdapter {
  readonly id = 'greenhouse'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname.endsWith('greenhouse.io')
  }
}
