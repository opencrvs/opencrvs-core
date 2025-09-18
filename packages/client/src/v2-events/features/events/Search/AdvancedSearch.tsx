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
import React, { useCallback, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import {
  Content,
  ContentSize,
  FormTabs,
  IFormTabProps
} from '@opencrvs/components'
import {
  EventState,
  FieldValue,
  SearchQueryParams
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { TabSearch } from './TabSearch'
import {
  checkScopeForEventSearch,
  parseFieldSearchParams,
  deserializeSearchParams
} from './utils'

export const advancedSearchMessages = {
  advancedSearch: {
    id: 'v2.config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'v2.config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  }
}

const messages = defineMessages(advancedSearchMessages)

export function AdvancedSearch() {
  const intl = useIntl()
  const allEvents = useEventConfigurations()
  const location = useLocation()

  const searchParams = SearchQueryParams.parse(
    deserializeSearchParams(location.search)
  )

  const advancedSearchEvents = allEvents.filter(
    (event) =>
      event.advancedSearch.length > 0 && checkScopeForEventSearch(event.id)
  )

  const [formValuesByTabId, setFormValuesByTabId] = useState<
    Record<string, EventState>
  >(() => {
    const initialState: Record<string, EventState> = {}
    const currentEvent = advancedSearchEvents.find(
      (e) => e.id === searchParams.eventType
    )
    for (const event of advancedSearchEvents) {
      if (currentEvent && currentEvent.id === event.id) {
        const parsedParams = parseFieldSearchParams(event, searchParams)
        initialState[event.id] = parsedParams
      } else {
        initialState[event.id] = {}
      }
    }
    return initialState
  })

  const formTabSections = advancedSearchEvents.map((a) => ({
    id: a.id,
    title: intl.formatMessage(a.label)
  })) satisfies IFormTabProps['sections']

  const selectedTabId =
    formTabSections.find((tab) => tab.id === searchParams.eventType)?.id ??
    formTabSections[0]?.id

  const [activeTabId, setActiveTabId] = useState<string>(selectedTabId)

  const currentEvent = allEvents.find((e) => e.id === activeTabId)
  if (!currentEvent) {
    return null
  }

  const currentTabSections = currentEvent.advancedSearch
  const currentFormValues = formValuesByTabId[activeTabId]

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const handleFormChange = useCallback(
    (updatedForm: Record<string, FieldValue>) => {
      setFormValuesByTabId((prev) => ({
        ...prev,
        [activeTabId]: updatedForm
      }))
    },
    [activeTabId]
  )

  return (
    <Content
      size={ContentSize.SMALL}
      subtitle={intl.formatMessage(messages.advancedSearchInstruction)}
      tabBarContent={
        <FormTabs
          activeTabId={activeTabId}
          sections={formTabSections}
          onTabClick={handleTabClick}
        />
      }
      title={intl.formatMessage(messages.advancedSearch)}
      titleColor={'copy'}
    >
      {currentTabSections.length > 0 && (
        <TabSearch
          key={currentEvent.id}
          currentEvent={currentEvent}
          fieldValues={currentFormValues}
          onChange={handleFormChange}
        />
      )}
    </Content>
  )
}
