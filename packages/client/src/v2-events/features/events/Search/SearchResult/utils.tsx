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

import { defineMessages, IntlShape } from 'react-intl'
import React from 'react'
import { first } from 'lodash'
import { ColumnContentAlignment, SORT_ORDER } from '@opencrvs/components'
import {
  defaultWorkqueueColumns,
  EventStatus,
  WorkqueueColumn,
  EventIndex,
  EventConfig,
  deepDropNulls,
  applyDraftToEventIndex,
  CtaActionType,
  getEventConfigById,
  Draft
} from '@opencrvs/commons/client'

import { formattedDuration } from '../../../../../utils/date-formatting'
import { DownloadButton } from '../../../../components/DownloadButton'
import { ActionCta } from '../ActionCta'
import RetryButton from '../../../../components/RetryButton'
import { OutboxEventIndex } from '../../useEvents/outbox'
import { SearchResultItemTitle } from './SearchResultItemTitle'

const messages = defineMessages({
  noRecord: {
    id: 'search.noRecord',
    defaultMessage:
      'No records {slug, select, draft {in drafts} outbox {require processing} other {{title}}}',
    description: 'The no record text'
  },
  noResult: {
    id: 'search.noResult',
    defaultMessage: 'No result',
    description: 'The no result text'
  },
  noResultFor: {
    id: 'search.noResultForSearchTerm',
    defaultMessage: 'No results for "{searchTerm}"',
    description: 'The no result text'
  },
  eventStatus: {
    id: 'events.status',
    defaultMessage:
      '{status, select, OUTBOX {Syncing..} CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARK_AS_DUPLICATE {Marked as a duplicate} NOTIFIED {In progress} other {Unknown}}'
  },
  waitingForAction: {
    id: 'events.outbox.waitingForAction',
    defaultMessage:
      'Waiting to {action, select, DECLARE {send} REGISTER {register} VALIDATE {send for approval} NOTIFY {send} REJECT {send for updates} ARCHIVE {archive} PRINT_CERTIFICATE {certify} REQUEST_CORRECTION {request correction} APPROVE_CORRECTION {approve correction} REJECT_CORRECTION {reject correction} ASSIGN {assign} UNASSIGN {unassign} other {action}}'
  },
  processingAction: {
    id: 'events.outbox.processingAction',
    defaultMessage:
      '{action, select, DECLARE {Sending} REGISTER {Registering} VALIDATE {Sending for approval} NOTIFY {Sending} REJECT {Sending for updates} ARCHIVE {Archiving} PRINT_CERTIFICATE {Certifying} REQUEST_CORRECTION {Requesting correction} APPROVE_CORRECTION {Approving correction} REJECT_CORRECTION {Rejecting correction} ASSIGN {Assigning} UNASSIGN {Unassigning} other {Processing action}}'
  }
})

export const ExtendedEventStatuses = {
  OUTBOX: 'OUTBOX',
  DRAFT: 'DRAFT'
} as const

/**
 *
 * @returns event status, correcting for local outbox and draft statuses
 */
export function getLocalEventStatus({
  eventId,
  currentStatus,
  outbox,
  drafts
}: {
  eventId: string
  currentStatus: EventStatus
  outbox: EventIndex[]
  drafts: Draft[]
}): EventStatus | keyof typeof ExtendedEventStatuses {
  const isInOutbox = outbox.some((outboxEvent) => outboxEvent.id === eventId)
  const isInDrafts = drafts.some((draft) => draft.eventId === eventId)

  if (isInOutbox) {
    return ExtendedEventStatuses.OUTBOX
  }

  if (isInDrafts) {
    return ExtendedEventStatuses.DRAFT
  }

  return currentStatus
}

export interface Column {
  label?: string
  width: number
  key: string
  sortFunction?: (columnName: string) => void
  isActionColumn?: boolean
  isSorted?: boolean
  alignment?: ColumnContentAlignment
}

export const COLUMNS = {
  ICON_WITH_NAME: 'iconWithName',
  ICON_WITH_NAME_EVENT: 'iconWithNameEvent',
  EVENT: 'type',
  DATE_OF_EVENT: 'dateOfEvent',
  PLACE_OF_EVENT: 'placeOfEvent',
  SENT_FOR_REVIEW: 'sentForReview',
  SENT_FOR_UPDATES: 'sentForUpdates',
  SENT_FOR_APPROVAL: 'sentForApproval',
  SENT_FOR_VALIDATION: 'sentForValidation',
  REGISTERED: 'registered',
  LAST_UPDATED: 'updatedAt',
  ACTIONS: 'actions',
  NOTIFICATION_SENT: 'notificationSent',
  NAME: 'title',
  TRACKING_ID: 'trackingId',
  REGISTRATION_NO: 'registrationNumber',
  NONE: 'none'
} as const

export function changeSortedColumn(
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
    case COLUMNS.PLACE_OF_EVENT:
      newSortedCol = COLUMNS.PLACE_OF_EVENT
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
    newSortedCol,
    newSortOrder
  }
}

export function createSortFunction(
  sortedCol: (typeof COLUMNS)[keyof typeof COLUMNS],
  sortOrder: (typeof SORT_ORDER)[keyof typeof SORT_ORDER],
  setSortedCol: (col: (typeof COLUMNS)[keyof typeof COLUMNS]) => void,
  setSortOrder: (order: (typeof SORT_ORDER)[keyof typeof SORT_ORDER]) => void
) {
  return function getSortFunction(column: string) {
    if (!Object.values(COLUMNS).some((col) => col === column)) {
      return undefined
    }

    return function handleSort(columnName: string) {
      const { newSortedCol, newSortOrder } = changeSortedColumn(
        columnName,
        sortedCol,
        sortOrder
      )

      setSortedCol(newSortedCol)
      setSortOrder(newSortOrder)
    }
  }
}

export function getDefaultColumns(
  intl: IntlShape,
  sortedCol: (typeof COLUMNS)[keyof typeof COLUMNS],
  getSortFunction: (
    column: string
  ) => ((columnName: string) => void) | undefined
): Array<Column> {
  return defaultWorkqueueColumns.map(
    ({ label, value }): Column => ({
      label: intl.formatMessage(label),
      width: value.$event === 'title' ? 35 : 15,
      key: value.$event,
      sortFunction: getSortFunction(value.$event),
      isSorted: sortedCol === value.$event
    })
  )
}

// @todo: update when workqueue actions buttons are updated
// @TODO: separate types for action button vs other columns
export function getColumns({
  isWideScreen,
  intl,
  columns,
  sortedCol,
  getSortFunction
}: {
  isWideScreen: boolean
  intl: IntlShape
  columns: WorkqueueColumn[]
  sortedCol: (typeof COLUMNS)[keyof typeof COLUMNS]
  getSortFunction: (
    column: string
  ) => ((columnName: string) => void) | undefined
}): Array<Column> {
  if (isWideScreen) {
    return columns.map(({ label, value }) => ({
      label: intl.formatMessage(label),
      width: value.$event === 'outbox' ? 35 : 15,
      key: value.$event,
      sortFunction: getSortFunction(value.$event),
      isSorted: sortedCol === value.$event
    }))
  } else {
    return columns
      .map(({ label, value }) => ({
        label: intl.formatMessage(label),
        width: 15,
        key: value.$event,
        sortFunction: getSortFunction(value.$event),
        isSorted: sortedCol === value.$event
      }))
      .slice(0, 2)
  }
}

export function getNoResultsText({
  title,
  slug,
  intl,
  searchTerm
}: {
  title: string
  slug?: string
  intl: IntlShape
  searchTerm?: string
}) {
  let noResultText = ''
  if (slug) {
    noResultText = intl.formatMessage(messages.noRecord, {
      slug,
      title: title.toLowerCase()
    })
  } else {
    if (searchTerm) {
      noResultText = intl.formatMessage(messages.noResultFor, {
        searchTerm
      })
    } else {
      noResultText = intl.formatMessage(messages.noResult)
    }
  }
  return noResultText
}

export function buildAvailableActionComponents({
  event,
  localEventStatus,
  actions,
  isWideScreen,
  redirectParam
}: {
  event: EventIndex
  localEventStatus: EventIndex['status'] | keyof typeof ExtendedEventStatuses
  actions: CtaActionType[]
  isWideScreen: boolean
  redirectParam: string
}) {
  const actionConfigs: Array<{ actionComponent: () => React.ReactNode }> = []

  if (isWideScreen) {
    actions.forEach((actionType: CtaActionType) => {
      actionConfigs.push({
        actionComponent: () => (
          <ActionCta
            key={actionType}
            actionType={actionType}
            event={event}
            redirectParam={redirectParam}
          />
        )
      })
    })

    if (localEventStatus === ExtendedEventStatuses.OUTBOX) {
      actionConfigs.push({
        actionComponent: () => <RetryButton key="retry" event={event} />
      })
    }
  }

  actionConfigs.push({
    actionComponent: () => (
      <DownloadButton
        key={`DownloadButton-${event.id}`}
        event={event}
        isDraft={localEventStatus === ExtendedEventStatuses.DRAFT}
      />
    )
  })

  return actionConfigs
}
export function processEventsToRows({
  events,
  eventConfigs,
  drafts,
  outbox,
  actions,
  redirectParam,
  isWideScreen,
  isOnline,
  intl
}: {
  events: EventIndex[]
  eventConfigs: EventConfig[]
  drafts: Draft[]
  outbox: OutboxEventIndex[]
  actions: CtaActionType[] // can be reduced to one?
  redirectParam: string
  isWideScreen: boolean
  isOnline: boolean
  intl: IntlShape
}) {
  return events.map((event) => {
    console.log(`Processing event ${event.id}`)
    const eventConfig = getEventConfigById(eventConfigs, event.type)

    const draft = first(drafts.filter((d) => d.eventId === event.id))
    const eventWithDraft = draft
      ? deepDropNulls(applyDraftToEventIndex(event, draft, eventConfig))
      : event

    const localEventStatus = getLocalEventStatus({
      eventId: eventWithDraft.id,
      currentStatus: eventWithDraft.status,
      outbox,
      drafts
    })

    const actionComponents = buildAvailableActionComponents({
      event: eventWithDraft,
      localEventStatus: eventWithDraft.status,
      actions,
      isWideScreen,
      redirectParam
    })

    const outboxMeta = outbox.find((o) => o.id === eventWithDraft.id)?.meta

    return {
      ...eventWithDraft,
      actions: actionComponents,
      label: eventConfig.label,
      type: intl.formatMessage(eventConfig.label),
      createdAt: formattedDuration(new Date(eventWithDraft.createdAt)),
      updatedAt: formattedDuration(new Date(eventWithDraft.updatedAt)),
      status: intl.formatMessage(messages.eventStatus, {
        status: localEventStatus
      }),
      title: (
        <SearchResultItemTitle
          event={eventWithDraft}
          eventConfig={eventConfig}
          localEventStatus={localEventStatus}
          redirectParam={redirectParam}
        />
      ),
      outbox: intl.formatMessage(
        isOnline ? messages.processingAction : messages.waitingForAction,
        {
          action:
            typeof outboxMeta?.actionType === 'string'
              ? outboxMeta.actionType
              : ''
        }
      )
    }
  })
}
