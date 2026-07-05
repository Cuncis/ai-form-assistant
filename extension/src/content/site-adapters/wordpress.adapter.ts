import { BaseAdapter } from './base-adapter'

export class WordpressAdapter extends BaseAdapter {
  readonly id = 'wordpress'

  matches(_url: URL): boolean {
    // refined once we see the target markup — generic Gravity Forms / CF7 / WPForms signatures
    return false
  }
}
