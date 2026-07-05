import { BaseAdapter } from './base-adapter'

export class TypeformAdapter extends BaseAdapter {
  readonly id = 'typeform'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname.endsWith('typeform.com') && url.pathname.startsWith('/to')
  }
}
