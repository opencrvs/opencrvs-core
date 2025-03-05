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
import { defineMessages, useIntl } from 'react-intl'
import { useQuery } from '@tanstack/react-query'
import { ErrorText } from '@opencrvs/components/lib'
import { workqueues } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { LoadingIndicator } from '@client/v2-events/components/LoadingIndicator'
import { WorkqueueLayout } from '@client/v2-events/layouts/workqueues'
import { useTRPC } from '@client/v2-events/trpc'
import { flattenFieldErrors, getAdvancedSearchFieldErrors } from './utils'
import { SearchModifierComponent } from './SearchModifier'
import { SearchResult } from './SearchResult'

const messagesToDefine = {
  edit: {
    defaultMessage: 'Edit',
    description: 'Edit button text',
    id: 'v2.buttons.edit'
  },
  noResult: {
    id: 'v2.search.noResult',
    defaultMessage: 'No results',
    description: 'The no result text'
  },
  searchResult: {
    defaultMessage: 'Search results',
    description:
      'The label for search result header in advancedSearchResult page',
    id: 'v2.advancedSearchResult.table.searchResult'
  },
  name: {
    defaultMessage: 'Name',
    description: 'Name label',
    id: 'v2.constants.name'
  },
  event: {
    defaultMessage: 'Event',
    description: 'Label for Event of event in work queue list item',
    id: 'v2.constants.event'
  },
  eventDate: {
    defaultMessage: 'Date of event',
    description: 'Label for event date in list item',
    id: 'v2.constants.eventDate'
  },
  noResults: {
    defaultMessage: 'No result',
    description:
      'Text to display if the search return no results for the current filters',
    id: 'v2.constants.noResults'
  },
  queryError: {
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails',
    id: 'v2.error.search'
  }
}

const messages = defineMessages(messagesToDefine)

export const SearchResultIndex = () => {
  const intl = useIntl()
  const trpc = useTRPC()
  const { getOutbox, getDrafts } = useEvents()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const { eventConfiguration: currentEvent } = useEventConfiguration(eventType)

  const searchParams = parse(window.location.search, {
    arrayFormat: 'comma'
  }) as Record<string, string>

  const normalizedSearchParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(',') : value ?? ''
    ])
  )

  const outbox = getOutbox()
  const drafts = getDrafts()
  const fieldErrors = getAdvancedSearchFieldErrors(currentEvent, searchParams)
  const fieldValueErrors = flattenFieldErrors(fieldErrors)

  const {
    data: queryData,
    isLoading,
    error: queryError
  } = useQuery({
    ...trpc.event.search.queryOptions({
      ...searchParams,
      type: eventType
    }),
    queryKey: trpc.event.search.queryKey({
      ...searchParams,
      type: eventType
    })
  })

  const total = queryData?.length || 0
  const workqueueId = 'all'
  const workqueueConfig =
    workqueueId in workqueues
      ? workqueues[workqueueId as keyof typeof workqueues]
      : null

  if (!workqueueConfig) {
    return null
  }

  let content
  let noResultText = intl.formatMessage(messages.noResult)
  if (isLoading) {
    content = (
      <div id="advanced-search_loader">
        <LoadingIndicator loading={true} />
      </div>
    )
  } else if (queryError || fieldValueErrors.length > 0) {
    noResultText = ''
    content = (
      <ErrorText id="advanced-search-result-error-text">
        {intl.formatMessage(messages.queryError)}
      </ErrorText>
    )
  } else if (queryData && total > 0) {
    content = (
      <SearchResult
        currentEvent={currentEvent}
        drafts={drafts}
        normalizedSearchParams={normalizedSearchParams}
        outbox={outbox}
        queryData={queryData}
        workqueueConfig={workqueueConfig}
      />
    )
  }

  return (
    <WQContentWrapper
      isMobileSize={false}
      noContent={total < 1 && !isLoading}
      noResultText={noResultText}
      tabBarContent={
        <SearchModifierComponent searchParams={normalizedSearchParams} />
      }
      title={`${intl.formatMessage(messages.searchResult)} ${
        isLoading ? '' : ' (' + total + ')'
      }`}
    >
      {content}
    </WQContentWrapper>
  )
}
