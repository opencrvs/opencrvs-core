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
import {
  EventConfig,
  FieldType,
  Inferred,
  QueryInputType
} from '@opencrvs/commons/client'
import { SearchResult } from '@client/v2-events/features/events/AdvancedSearch/SearchResult'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { QUICK_SEARCH_KEY } from '../AdvancedSearch/utils'
import { useEventConfigurations } from '../useEventConfiguration'

const searchFieldTypeMapping = {
  [FieldType.NAME]: 'fuzzy',
  [FieldType.ID]: 'exact',
  [FieldType.EMAIL]: 'exact',
  [FieldType.PHONE]: 'exact'
} as const

const searchFields = Object.keys(
  searchFieldTypeMapping
) as (keyof typeof searchFieldTypeMapping)[]

function buildQueryFromQuickSearchFields(searchableFields: Inferred[]) {
  const queryObj = searchableFields.reduce((acc, field) => {
    const fieldType = field.type as keyof typeof searchFieldTypeMapping
  }, {})

  return queryObj
}

function buildQuickSearchQuery(
  searchParams: Record<string, string>,
  events: EventConfig[]
): QueryInputType {
  const fieldsOfEvents = events.reduce<Inferred[]>((acc, event) => {
    const fields = getAllUniqueFields(event)
    return [...acc, ...fields]
  }, [])

  const fieldsToSearch = fieldsOfEvents
    .filter((field) => {
      // @ts-ignore
      if (searchFields.includes(field.type)) {
        return field
      } else {
        return undefined
      }
    })
    .filter((field) => Boolean(field))

  const query = buildQueryFromQuickSearchFields(fieldsToSearch)
}

export const QuickSearchIndex = () => {
  const { searchEvent } = useEvents()
  const eventConfigurations = useEventConfigurations()

  const searchParams = parse(window.location.search, {
    arrayFormat: 'comma'
  }) as Record<string, string>

  const query = buildQuickSearchQuery(searchParams, eventConfigurations)
  const queryData = searchEvent.useSuspenseQuery(query, QUICK_SEARCH_KEY)

  return <SearchResult queryData={queryData} />
}
