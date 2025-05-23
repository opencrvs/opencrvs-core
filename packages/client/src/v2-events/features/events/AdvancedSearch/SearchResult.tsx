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
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled, { useTheme } from 'styled-components'
import { Link } from 'react-router-dom'
import { mapKeys } from 'lodash'
import {
  defaultColumns,
  EventIndex,
  EventConfig,
  workqueues,
  FieldValue
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  Workqueue,
  ColumnContentAlignment
} from '@opencrvs/components/lib/Workqueue'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { formattedDuration } from '@client/utils/date-formatting'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { SearchModifierComponent } from './SearchModifier'

const SORT_ORDER = {
  ASCENDING: 'asc',
  DESCENDING: 'desc'
} as const

const COLUMNS = {
  ICON_WITH_NAME: 'iconWithName',
  ICON_WITH_NAME_EVENT: 'iconWithNameEvent',
  EVENT: 'event',
  DATE_OF_EVENT: 'dateOfEvent',
  SENT_FOR_REVIEW: 'sentForReview',
  SENT_FOR_UPDATES: 'sentForUpdates',
  SENT_FOR_APPROVAL: 'sentForApproval',
  SENT_FOR_VALIDATION: 'sentForValidation',
  REGISTERED: 'registered',
  LAST_UPDATED: 'lastUpdated',
  ACTIONS: 'actions',
  NOTIFICATION_SENT: 'notificationSent',
  NAME: 'name',
  TRACKING_ID: 'trackingId',
  REGISTRATION_NO: 'registrationNumber',
  NONE: 'none'
} as const

const NondecoratedLink = styled(Link)`
  text-decoration: none;
  color: 'primary';
`

interface Column {
  label?: string
  width: number
  key: string
  sortFunction?: (columnName: string) => void
  isActionColumn?: boolean
  isSorted?: boolean
  alignment?: ColumnContentAlignment
}

function changeSortedColumn(
  columnName: string,
  presentSortedCol: (typeof COLUMNS)[keyof typeof COLUMNS],
  presentSortOrder: (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
) {
  let newSortedCol: (typeof COLUMNS)[keyof typeof COLUMNS]
  let newSortOrder: (typeof SORT_ORDER)[keyof typeof SORT_ORDER] =
    SORT_ORDER.ASCENDING

  switch (columnName) {
    case COLUMNS.ICON_WITH_NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.EVENT:
      newSortedCol = COLUMNS.EVENT
      break
    case COLUMNS.DATE_OF_EVENT:
      newSortedCol = COLUMNS.DATE_OF_EVENT
      break
    case COLUMNS.SENT_FOR_REVIEW:
      newSortedCol = COLUMNS.SENT_FOR_REVIEW
      break
    case COLUMNS.SENT_FOR_UPDATES:
      newSortedCol = COLUMNS.SENT_FOR_UPDATES
      break
    case COLUMNS.SENT_FOR_APPROVAL:
      newSortedCol = COLUMNS.SENT_FOR_APPROVAL
      break
    case COLUMNS.REGISTERED:
      newSortedCol = COLUMNS.REGISTERED
      break
    case COLUMNS.SENT_FOR_VALIDATION:
      newSortedCol = COLUMNS.SENT_FOR_VALIDATION
      break
    case COLUMNS.NOTIFICATION_SENT:
      newSortedCol = COLUMNS.NOTIFICATION_SENT
      break
    case COLUMNS.LAST_UPDATED:
      newSortedCol = COLUMNS.LAST_UPDATED
      break
    case COLUMNS.TRACKING_ID:
      newSortedCol = COLUMNS.TRACKING_ID
      break
    case COLUMNS.REGISTRATION_NO:
      newSortedCol = COLUMNS.REGISTRATION_NO
      break
    default:
      newSortedCol = COLUMNS.NONE
  }

  if (newSortedCol === presentSortedCol) {
    if (presentSortOrder === SORT_ORDER.ASCENDING) {
      newSortOrder = SORT_ORDER.DESCENDING
    } else {
      newSortOrder = SORT_ORDER.ASCENDING
      newSortedCol = COLUMNS.NONE
    }
  }

  return {
    newSortedCol: newSortedCol,
    newSortOrder: newSortOrder
  }
}

const messagesToDefine = {
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
  }
}

const messages = defineMessages(messagesToDefine)

interface Props {
  workqueueConfig: (typeof workqueues)['all']
  eventConfig: EventConfig
  searchParams: Record<string, FieldValue>
  queryData: EventIndex[]
}

export const SearchResult = ({
  workqueueConfig,
  eventConfig,
  searchParams,
  queryData
}: Props) => {
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()
  const total = queryData.length
  const noResultText = intl.formatMessage(messages.noResult)

  const { getOutbox } = useEvents()
  const { getRemoteDrafts } = useDrafts()
  const outbox = getOutbox()
  const drafts = getRemoteDrafts()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.NONE)
  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.ASCENDING)

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const transformData = (eventData: EventIndex[]) => {
    return eventData
      .map((event) => {
        const { declaration, ...rest } = event
        return { ...rest, ...mapKeys(declaration, (_, key) => `${key}`) }
      })
      .map((doc) => {
        const isInOutbox = outbox.some(
          (outboxEvent) => outboxEvent.id === doc.id
        )
        const isInDrafts = drafts.some((draft) => draft.id === doc.id)

        const getEventStatus = () => {
          if (isInOutbox) {
            return 'OUTBOX'
          }
          if (isInDrafts) {
            return 'DRAFT'
          }
          return doc.status
        }

        const titleColumnId = workqueueConfig.columns[0].id
        const status = doc.status

        const title = flattenedIntl.formatMessage(eventConfig.title, doc)

        return {
          ...doc,
          event: intl.formatMessage(eventConfig.label),
          createdAt: formattedDuration(new Date(doc.createdAt)),
          modifiedAt: formattedDuration(new Date(doc.updatedAt)),
          status: intl.formatMessage(
            {
              id: `v2.events.status`,
              defaultMessage:
                '{status, select, OUTBOX {Syncing..} CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} NOTIFIED {In progress} other {Unknown}}'
            },
            {
              status: getEventStatus()
            }
          ),
          [titleColumnId]: isInOutbox ? (
            <IconWithName name={title} status={status} />
          ) : (
            <NondecoratedLink
              to={ROUTES.V2.EVENTS.OVERVIEW.buildPath({
                eventId: doc.id
              })}
            >
              <IconWithName name={title} status={status} />
            </NondecoratedLink>
          )
        }
      })
  }

  function getDefaultColumns(): Array<Column> {
    return workqueueConfig.defaultColumns.map(
      (column): Column => ({
        label:
          column in defaultColumns
            ? intl.formatMessage(
                defaultColumns[column as keyof typeof defaultColumns].label
              )
            : '',
        width: 25,
        key: column,
        sortFunction: onColumnClick,
        isSorted: sortedCol === column
      })
    )
  }

  // @todo: update when workqueue actions buttons are updated
  // @TODO: separate types for action button vs other columns
  function getColumns(): Array<Column> {
    if (windowWidth > theme.grid.breakpoints.lg) {
      return workqueueConfig.columns.map((column) => ({
        label: intl.formatMessage(column.label),
        width: 35,
        key: column.id,
        sortFunction: onColumnClick,
        isSorted: sortedCol === column.id
      }))
    } else {
      return workqueueConfig.columns
        .map((column) => ({
          label: intl.formatMessage(column.label),
          width: 35,
          key: column.id,
          sortFunction: onColumnClick,
          isSorted: sortedCol === column.id
        }))
        .slice(0, 2)
    }
  }

  return (
    <WQContentWrapper
      isMobileSize={false}
      noContent={total < 1}
      noResultText={noResultText}
      tabBarContent={
        <SearchModifierComponent
          eventConfig={eventConfig}
          searchParams={searchParams}
        />
      }
      title={`${intl.formatMessage(messages.searchResult)} ${
        ' (' + total + ')'
      }`}
    >
      <Workqueue
        columns={getColumns().concat(getDefaultColumns())}
        content={transformData(queryData)}
        hideLastBorder={true}
      />
    </WQContentWrapper>
  )
}
