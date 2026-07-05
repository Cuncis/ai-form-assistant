import { BaseAdapter } from './base-adapter'

export class GoogleFormsAdapter extends BaseAdapter {
  readonly id = 'google-forms'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname === 'docs.google.com' && url.pathname.startsWith('/forms')
  }
}
