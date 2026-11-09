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
import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import {
  EventConfig,
  findEventConfigForRecord,
  getEventConfigById,
  resolveEventConfigInTimeZone,
  toPlainDateInTimeZone,
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

/** How often the date in the country is checked while a component uses it. */
const TODAY_CHECK_INTERVAL_MS = 60 * 1000

/**
 * Today's date in the country, shared by every component that uses
 * `useCountryToday`. Only refreshes when the day changes (when current date
 * is not the same as refreshedAt date).
 */
const countryToday: {
  refreshedAt: Date
  timeZone?: string
  listeners: Set<() => void>
  intervalId?: ReturnType<typeof setInterval>
} = { refreshedAt: new Date(), listeners: new Set() }

/** @returns true when the date in the country changed since the last check */
function refreshCountryToday() {
  const now = new Date()
  const { timeZone } = countryToday
  if (
    timeZone &&
    toPlainDateInTimeZone(countryToday.refreshedAt, timeZone) ===
      toPlainDateInTimeZone(now, timeZone)
  ) {
    return false
  }
  countryToday.refreshedAt = now
  return true
}

function checkCountryToday() {
  if (refreshCountryToday()) {
    countryToday.listeners.forEach((listener) => listener())
  }
}

function subscribeToCountryToday(listener: () => void) {
  countryToday.listeners.add(listener)
  if (!countryToday.intervalId) {
    countryToday.intervalId = setInterval(
      checkCountryToday,
      TODAY_CHECK_INTERVAL_MS
    )
  }

  return () => {
    countryToday.listeners.delete(listener)
    if (countryToday.listeners.size === 0) {
      clearInterval(countryToday.intervalId)
      countryToday.intervalId = undefined
    }
  }
}

function getCountryToday() {
  // No timer runs while nothing uses the date, so it can be out of date
  if (countryToday.listeners.size === 0) {
    refreshCountryToday()
  }
  return countryToday.refreshedAt
}

/**
 * @returns a time on today's date in the country's time zone. It is not the
 * current time, so use only its date. The value changes only when the date
 * changes. Components that depend on today's date render again at midnight, not
 * every minute.
 */
function useCountryToday() {
  const timeZone = useCountryTimeZone()
  if (countryToday.timeZone !== timeZone) {
    countryToday.timeZone = timeZone
    countryToday.refreshedAt = new Date()
  }
  return useSyncExternalStore(subscribeToCountryToday, getCountryToday)
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
  const today = useCountryToday()

  // Resolved again when the date changes, so a version takes effect without a reload.
  return useMemo(
    () =>
      versionedConfigs.map((config) =>
        resolveEventConfigInTimeZone(config, timeZone, today)
      ),
    [versionedConfigs, timeZone, today]
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
 * outside a record page (actions, drafts, validation, workqueue and search rows). A
 * record page uses
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
