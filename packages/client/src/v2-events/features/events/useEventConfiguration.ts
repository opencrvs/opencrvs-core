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
import { useCallback, useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import {
  EventConfig,
  findEventConfigForRecord,
  getEventConfigById,
  resolveEventConfigInTimeZone,
  VersionedEventConfig
} from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'
import { getOfflineData } from '@client/offline/selectors'
import { buttonMessages, errorMessages } from '@client/i18n/messages'
import { throwStructuredError } from '@client/v2-events/routes/TRPCErrorBoundary'

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
function useVersionedEventConfiguration(eventIdentifier: string) {
  return getEventConfigById(useVersionedEventConfigurations(), eventIdentifier)
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

/** A record, as far as resolving its configuration version is concerned */
interface VersionedRecord {
  type: string
  configVersionId: string
  trackingId?: string
}

/**
 * @returns the configuration of the version `record` was created under. Every action on
 * a record uses that version.
 * When that version is not configured, shows an error page naming the record, the event
 * and the version.
 */
export function useEventConfigurationForRecord(record: VersionedRecord): {
  eventConfiguration: EventConfig
} {
  const intl = useIntl()
  const versionedConfig = useVersionedEventConfiguration(record.type)
  const eventConfiguration = findEventConfigForRecord(versionedConfig, record)

  if (eventConfiguration) {
    return { eventConfiguration }
  }

  return throwStructuredError({
    title: intl.formatMessage(errorMessages.unknownConfigVersion),
    message: intl.formatMessage(errorMessages.unknownConfigVersionDescription, {
      trackingId: record.trackingId ?? '',
      version: record.configVersionId,
      event: intl.formatMessage(versionedConfig.label)
    }),
    redirection: {
      label: intl.formatMessage(buttonMessages.refresh),
      path: window.location.pathname + window.location.search
    },
    variant: 'notice'
  })
}

/**
 * @returns a function giving the configuration of the version a record was created
 * under, or undefined when that version is not cached. For code that handles records
 * outside a record page (actions, drafts, validation).Meanwhile, a record page uses
 * `useEventConfigurationForRecord`.
 */
export function useEventConfigurationResolver() {
  const versionedConfigs = useVersionedEventConfigurations()

  return useCallback(
    (record: VersionedRecord): EventConfig | undefined => {
      const config = versionedConfigs.find(({ id }) => id === record.type)
      return config && findEventConfigForRecord(config, record)
    },
    [versionedConfigs]
  )
}
