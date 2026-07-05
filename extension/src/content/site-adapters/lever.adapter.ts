import { BaseAdapter } from './base-adapter'

export class LeverAdapter extends BaseAdapter {
  readonly id = 'lever'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname === 'jobs.lever.co'
  }
}
