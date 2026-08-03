/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  EventConfig,
  findEventConfigVersion,
  resolveActiveEventConfigVersion,
  resolveVersionForDate,
  toPlainDate
} from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'

/**
 * Fetches every configured event, across every form version — multiple
 * entries can share an `id`, distinguished by `version`.
 * @returns the full list of event configurations
 */
export function useEventConfigurations() {
  const trpc = useTRPC()
  const config = useSuspenseQuery({
    ...trpc.event.config.get.queryOptions(),
    queryKey: trpc.event.config.get.queryKey()
  }).data

  return config
}

/**
 * Resolves the form version an *existing* event is pinned to — mirrors
 * `getEventConfigurationForEvent` on the server. Reads `configVersion` when
 * it's available (full `EventDocument`s); falls back to resolving by
 * `createdAt` for shapes that don't carry it (e.g. `EventIndex`/workqueue
 * rows), or for events created before this pin existed.
 */
export function resolveEventConfiguration(
  configs: EventConfig[],
  event: { type: string; createdAt: string; configVersion?: string }
): EventConfig {
  if (event.configVersion) {
    return findEventConfigVersion(configs, event.type, event.configVersion)
  }

  return resolveVersionForDate(
    configs,
    event.type,
    toPlainDate(event.createdAt)
  )
}

/**
 * Resolves the form version currently in effect for `eventType` — the
 * version a brand-new, non-digitized declaration should be pinned to.
 *
 * Do not use this for an *existing* event — it always resolves to whatever
 * is active today, not the version the event was actually pinned to. Use
 * {@link useEventConfigurationForEvent} instead.
 *
 * @param eventIdentifier e.g. 'birth', 'death', 'marriage' or any configured event
 * @returns event configuration
 */
export function useEventConfiguration(eventIdentifier: string): {
  eventConfiguration: EventConfig
} {
  const config = useEventConfigurations()
  const eventConfiguration = resolveActiveEventConfigVersion(
    config,
    eventIdentifier
  )

  return { eventConfiguration }
}

/**
 * Resolves the form version a specific event is pinned to, so
 * rendering/validating a record created (or corrected) years ago uses the
 * rules that were active when it was created — not whatever is live today.
 *
 * Prefer this over {@link useEventConfiguration} whenever an `EventDocument`
 * (or `EventIndex`) is already in scope.
 */
export function useEventConfigurationForEvent(event: {
  type: string
  createdAt: string
  configVersion?: string
}): { eventConfiguration: EventConfig } {
  const config = useEventConfigurations()
  const eventConfiguration = resolveEventConfiguration(config, event)

  return { eventConfiguration }
}
