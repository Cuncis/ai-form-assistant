import { BaseAdapter } from './base-adapter'

export class WorkdayAdapter extends BaseAdapter {
  readonly id = 'workday'

  matches(url: URL): boolean {
    const hostname = url.hostname
    return hostname.endsWith('myworkdayjobs.com')
  }
}
