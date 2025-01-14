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
import { EventConfig } from '@opencrvs/commons/client'
import { api } from '@client/v2-events/trpc'

/**
 * Fetches configured events and finds a matching event
 * @returns a list of event configurations
 */
export function useEventConfigurations() {
  const [config] = api.config.get.useSuspenseQuery()
  return config
}

/**
 * Fetches configured events and finds a matching event
 * @param eventIdentifier e.g. 'birth', 'death', 'marriage' or any configured event
 * @returns event configuration
 */
export function useEventConfiguration(eventIdentifier: string): {
  eventConfiguration: EventConfig
} {
  const [config] = api.config.get.useSuspenseQuery()
  const eventConfiguration = config.find(
    (event) => event.id === eventIdentifier
  )
  if (!eventConfiguration) {
    throw new Error('Event configuration not found')
  }
  return { eventConfiguration }
}
