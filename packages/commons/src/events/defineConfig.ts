import { EventConfig, EventConfigInput } from './EventConfig'
import { findPageFields, resolveFieldLabels } from './utils'

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (config: EventConfigInput) => {
  const parsed = EventConfig.parse(config)

  const pageFields = findPageFields(parsed)

  return EventConfig.parse({
    ...parsed,
    summary: resolveFieldLabels({
      config: parsed.summary,
      pageFields
    }),
    workqueues: parsed.workqueues.map((workqueue) =>
      resolveFieldLabels({
        config: workqueue,
        pageFields
      })
    )
  })
}
