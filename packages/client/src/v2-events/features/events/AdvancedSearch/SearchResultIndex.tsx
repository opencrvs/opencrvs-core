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

import React from 'react'
import { parse } from 'query-string'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  DataCondition,
  EventConfig,
  workqueues
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { SearchResult } from './SearchResult'

type Condition =
  | { type: 'fuzzy'; term: string }
  | { type: 'exact'; term: string }
  | { type: 'range'; gte: string; lte: string }

function buildCondition(type: string, value: string): Condition {
  switch (type) {
    case 'FUZZY':
      return { type: 'fuzzy', term: value }
    case 'EXACT':
      return { type: 'exact', term: value }
    case 'RANGE':
      const [gte, lte] = value.split(',')
      return { type: 'range', gte, lte }
    default:
      return { type: 'exact', term: value } // Fallback to exact match
  }
}

function buildDataConditionFromSearchKeys(
  searchKeys: {
    fieldId: string
    config?: {
      type: 'FUZZY' | 'EXACT' | 'RANGE'
    }
  }[],
  rawInput: Record<string, string> // values from UI or query string
): Record<string, Condition> {
  const result: Record<string, Condition> = {}

  for (const { fieldId, config } of searchKeys) {
    const value = rawInput[fieldId]
    if (!value) {
      continue
    }

    const condition = buildCondition(config?.type ?? 'EXACT', value)

    // Use the fieldId directly as the key in the result (flat structure)
    result[fieldId] = condition
  }

  return result
}

function buildDataCondition(
  flat: Record<string, string>,
  eventConfig: EventConfig
): DataCondition {
  const advancedSearch = eventConfig.advancedSearch

  // Flatten all fields into a single list of search keys
  const searchKeys = advancedSearch.flatMap((section) =>
    section.fields.map((field) => ({
      fieldId: field.fieldId,
      config: field.config // assuming field structure has a `config` prop
    }))
  )

  return buildDataConditionFromSearchKeys(searchKeys, flat)
}

export const SearchResultIndex = () => {
  const { searchEvent } = useEvents()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const { eventConfiguration: currentEvent } = useEventConfiguration(eventType)

  const searchParams = parse(window.location.search, {
    arrayFormat: 'comma'
  }) as Record<string, string>

  const data = buildDataCondition(searchParams, currentEvent)
  const queryData = searchEvent.useSuspenseQuery(eventType, searchParams)
  const workqueueId = 'all'
  const workqueueConfig =
    workqueueId in workqueues
      ? workqueues[workqueueId as keyof typeof workqueues]
      : null

  if (!workqueueConfig) {
    return null
  }

  return (
    <SearchResult
      currentEvent={currentEvent}
      queryData={queryData ?? []}
      searchParams={searchParams}
      workqueueConfig={workqueueConfig}
    />
  )
}
