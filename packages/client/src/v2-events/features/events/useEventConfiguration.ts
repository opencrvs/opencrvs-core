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
import { useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import {
  EventConfig,
  getEventConfigForRecord,
  getOrThrow,
  resolveEventConfigInTimeZone,
  VersionedEventConfig
} from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'
import { getOfflineData } from '@client/offline/selectors'

/**
 * Event configuration only changes when countryconfig is deployed, so refetching it with staleTime 0 causes lots of unnecessary calls.
 */
const EVENT_CONFIGURATION_STALE_TIME_MS = 1 * 60 * 1000

/** @returns the country's time zone (IANA), in which configuration versions take effect. */
export function useCountryTimeZone() {
  return useSelector(getOfflineData).config.SYSTEM_IANA_TIMEZONE
}

/**
 * Fetches configured events with every version of their configuration.
 */
export function useVersionedEventConfigurations(): VersionedEventConfig[] {
  const trpc = useTRPC()

  return useSuspenseQuery({
    ...trpc.event.config.get.queryOptions(),
    queryKey: trpc.event.config.get.queryKey(),
    staleTime: import.meta.env.PROD ? EVENT_CONFIGURATION_STALE_TIME_MS : 0
  }).data
}

/**
 * Fetches configured events and finds a matching event, with every version of its configuration
 * @param eventIdentifier e.g. 'birth', 'death', 'marriage' or any configured event
 */
export function useVersionedEventConfiguration(eventIdentifier: string) {
  return getOrThrow(
    useVersionedEventConfigurations().find(({ id }) => id === eventIdentifier),
    `Configuration not found for event: ${eventIdentifier}`
  )
}

/**
 * Fetches configured events
 * @returns a list of event configurations, each at the version in effect today in the country's time zone
 */
export function useEventConfigurations() {
  const versionedConfigs = useVersionedEventConfigurations()
  const timeZone = useCountryTimeZone()

  return useMemo(
    () =>
      versionedConfigs.map((config) =>
        resolveEventConfigInTimeZone(config, timeZone)
      ),
    [versionedConfigs, timeZone]
  )
}

/**
 * Fetches configured events and finds a matching event
 * @param eventIdentifier e.g. 'birth', 'death', 'marriage' or any configured event
 * @returns event configuration
 */
export function useEventConfiguration(eventIdentifier: string): {
  eventConfiguration: EventConfig
} {
  const config = useEventConfigurations()
  const eventConfiguration = config.find(
    (event) => event.id === eventIdentifier
  )
  if (!eventConfiguration) {
    throw new Error('Event configuration not found')
  }

  return { eventConfiguration }
}

/**
 * @returns the configuration of the version `record` was created under. Every action on
 * a record uses that version.
 */
export function useEventConfigurationForRecord(record: {
  type: string
  configVersionId?: string
}): { eventConfiguration: EventConfig } {
  return {
    eventConfiguration: getEventConfigForRecord(
      useVersionedEventConfiguration(record.type),
      record
    )
  }
}
