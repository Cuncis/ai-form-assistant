import type { SiteAdapter } from './base-adapter'
import { LinkedinAdapter } from './linkedin.adapter'
import { GreenhouseAdapter } from './greenhouse.adapter'
import { LeverAdapter } from './lever.adapter'
import { AshbyAdapter } from './ashby.adapter'
import { WorkdayAdapter } from './workday.adapter'
import { GoogleFormsAdapter } from './google-forms.adapter'
import { TypeformAdapter } from './typeform.adapter'
import { WordpressAdapter } from './wordpress.adapter'
import { GenericAdapter } from './generic.adapter'

const adapters: SiteAdapter[] = [
  new LinkedinAdapter(),
  new GreenhouseAdapter(),
  new LeverAdapter(),
  new AshbyAdapter(),
  new WorkdayAdapter(),
  new GoogleFormsAdapter(),
  new TypeformAdapter(),
  new WordpressAdapter(),
  new GenericAdapter(), // must stay last — catch-all
]

export function resolveAdapter(url: URL): SiteAdapter {
  const found = adapters.find((adapter) => adapter.matches(url))
  return found ?? adapters[adapters.length - 1]!
}
