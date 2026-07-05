import { BaseAdapter } from './base-adapter'

/** Fallback for contact forms, CRMs, and any site with no dedicated adapter. */
export class GenericAdapter extends BaseAdapter {
  readonly id = 'generic'

  matches(_url: URL): boolean {
    return true
  }
}
