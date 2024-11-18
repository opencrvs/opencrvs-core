import { z } from 'zod'
import { Label, Summary } from '../utils'
import { ActionConfig } from './ActionConfig'

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 */
export const EventConfig = z.object({
  id: z.string(),
  label: Label,
  summary: Summary,
  // deduplication: Deduplication,
  flags: z.array(z.string()),
  actions: z.array(ActionConfig)
})
