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
import {
  ActionType,
  EventConfig,
  EventDocument,
  getEventConfigEffectiveAt,
  getEventConfigForAction,
  toPlainDate
} from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'

/**
 * Fetches configured events, with every version of each action as served by country
 * config. Resolve a version before reading an action's configuration: see
 * `useEventConfigurations` and `useEventConfigurationForAction`.
 */
export function useEventConfigurationVersions() {
  const trpc = useTRPC()
  const config = useSuspenseQuery({
    ...trpc.event.config.get.queryOptions(),
    queryKey: trpc.event.config.get.queryKey()
  }).data

  return config
}

/** `config` with the version of each action in effect today. */
export function getEventConfigEffectiveToday(config: EventConfig) {
  return getEventConfigEffectiveAt(
    config,
    toPlainDate(new Date().toISOString())
  )
}

/**
 * Fetches configured events, each with the version of its actions in effect today:
 * which actions can be performed always follows today's configuration.
 * @returns a list of event configurations
 */
export function useEventConfigurations() {
  const configs = useEventConfigurationVersions()
  const today = toPlainDate(new Date().toISOString())
  return useMemo(
    () => configs.map((config) => getEventConfigEffectiveAt(config, today)),
    [configs, today]
  )
}

function findEventConfiguration(configs: EventConfig[], eventType: string) {
  const eventConfiguration = configs.find((event) => event.id === eventType)
  if (!eventConfiguration) {
    throw new Error('Event configuration not found')
  }
  return eventConfiguration
}

/**
 * Fetches configured events and finds a matching event
 * @param eventIdentifier e.g. 'birth', 'death', 'marriage' or any configured event
 * @returns event configuration, with the version of each action in effect today
 */
export function useEventConfiguration(eventIdentifier: string): {
  eventConfiguration: EventConfig
} {
  return {
    eventConfiguration: findEventConfiguration(
      useEventConfigurations(),
      eventIdentifier
    )
  }
}

/**
 * The configuration an action on `event` is performed with, as the server resolves it:
 * DECLARE and NOTIFY use the versions in effect when the record was created, other
 * actions the version in effect today, reading the declaration with the DECLARE /
 * NOTIFY versions the record was made with.
 */
export function useEventConfigurationForAction(
  event: EventDocument,
  actionType: ActionType
): { eventConfiguration: EventConfig } {
  return {
    eventConfiguration: getEventConfigForAction(
      findEventConfiguration(useEventConfigurationVersions(), event.type),
      { type: actionType },
      event,
      new Date()
    )
  }
}
