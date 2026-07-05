import { BaseAdapter } from './base-adapter'

export class AshbyAdapter extends BaseAdapter {
  readonly id = 'ashby'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname === 'jobs.ashbyhq.com'
  }
}
