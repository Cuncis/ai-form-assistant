import { BaseAdapter } from './base-adapter'

export class LinkedinAdapter extends BaseAdapter {
  readonly id = 'linkedin'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname.endsWith('linkedin.com') && url.pathname.startsWith('/jobs')
  }
}
