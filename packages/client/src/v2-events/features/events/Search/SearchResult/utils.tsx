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
import { SORT_ORDER, Pill } from '@opencrvs/components'
import {
  ActionFlag,
  EventStatus,
  EventIndex,
  EventConfig,
  deepDropNulls,
  applyDraftToEventIndex,
  getEventConfigById,
  Draft,
  Flag,
  InherentFlags,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { getFlagLabel } from '@client/v2-events/messages/flags'

import {
  formatLongDate,
  formattedDuration
} from '../../../../../utils/date-formatting'
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

export const workqueueHeaderMessages = defineMessages({
  record: {
    id: 'workqueue.header.record',
    defaultMessage: 'Record',
    description: 'Label for the workqueue record column header'
  },
  sent: {
    id: 'workqueue.header.sent',
    defaultMessage: 'Sent',
    description: 'Label for the workqueue sent column header'
  },
  updated: {
    id: 'workqueue.header.updated',
    defaultMessage: 'Updated',
    description:
      'Label for the workqueue date column header in queues where records have not been sent (drafts, outbox)'
  },
  flags: {
    id: 'workqueue.header.flags',
    defaultMessage: 'Flags',
    description: 'Label for the workqueue flags column header'
  }
})

type PillType = 'active' | 'inactive' | 'pending' | 'default' | 'neutral'

const INHERENT_FLAG_PILL_TYPES: Partial<Record<Flag, PillType>> = {
  [InherentFlags.CORRECTION_REQUESTED]: 'active',
  [InherentFlags.POTENTIAL_DUPLICATE]: 'inactive',
  [InherentFlags.REJECTED]: 'inactive',
  [InherentFlags.INCOMPLETE]: 'pending'
}

/** Renders the flags of a record as pills for the workqueue flags cell */
export function getFlagPills(
  flags: Flag[],
  eventConfig: EventConfig,
  intl: IntlShape
) {
  const pills = flags
    // Action flags (`actiontype:actionstatus`) are transient processing
    // markers, and edit-in-progress never survives past the edit flow
    .filter((flag) => !ActionFlag.safeParse(flag).success)
    .filter((flag) => flag !== InherentFlags.EDIT_IN_PROGRESS)
    .map((flag) => {
      const label = getFlagLabel(intl, eventConfig, flag)
      const type = INHERENT_FLAG_PILL_TYPES[flag] ?? 'neutral'

      return (
        <Pill key={flag} label={label} size="small" title={label} type={type} />
      )
    })

  return pills.length > 0 ? pills : null
}

export const ExtendedEventStatuses = {
  OUTBOX: 'OUTBOX',
  DRAFT: 'DRAFT'
} as const

/**
 * @returns event status, correcting for local outbox and draft statuses
 */
function getLocalEventStatus({
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

  // Note: The order is intentional here. Drafts take precedence over outbox.
  // When triggering event, there is a brief moment when both draft and outbox may exist.
  if (isInDrafts) {
    return ExtendedEventStatuses.DRAFT
  }

  if (isInOutbox) {
    return ExtendedEventStatuses.OUTBOX
  }

  return currentStatus
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

function buildAvailableActionComponents({
  event,
  localEventStatus,
  action,
  isWideScreen
}: {
  event: EventIndex
  localEventStatus: EventIndex['status'] | keyof typeof ExtendedEventStatuses
  action?: { type: WorkqueueActionType }
  isWideScreen: boolean
}) {
  const actionConfigs: Array<{ actionComponent: () => React.ReactNode }> = []

  if (isWideScreen) {
    if (action) {
      actionConfigs.push({
        actionComponent: () => (
          <ActionCta
            key={'ActionCta-' + event.id}
            actionType={action.type}
            event={event}
          />
        )
      })
    }

    if (localEventStatus === ExtendedEventStatuses.OUTBOX) {
      actionConfigs.push({
        actionComponent: () => (
          <RetryButton key={'RetryButton-' + event.id} event={event} />
        )
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

/**
 * Given events with their configs, returns Workqueue row data with necessary transformations and computed fields to perform sorting and display of actions based on local event status (accounting for outbox and drafts).
 */
export function enrichEventsForWorkueue({
  events,
  eventConfigs,
  drafts,
  outbox,
  getEventTitle
}: {
  events: EventIndex[]
  eventConfigs: EventConfig[]
  drafts: Draft[]
  outbox: OutboxEventIndex[]
  getEventTitle: (
    eventConfig: EventConfig,
    event: EventIndex
  ) => { title: string | null; useFallbackTitle: boolean }
}): {
  enrichedEvent: EventIndex & { title: string | null }
  localEventStatus: EventIndex['status'] | keyof typeof ExtendedEventStatuses
}[] {
  return events.map((event) => {
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

    const { title } = getEventTitle(eventConfig, eventWithDraft)
    return {
      enrichedEvent: { ...eventWithDraft, title },
      localEventStatus
    }
  })
}

/**
 * Given events with their configs, returns Workqueue row data with necessary transformations and computed fields
 */
export function processEventsToRows({
  enrichedEvents,
  eventConfigs,
  outbox,
  action,
  isWideScreen,
  isOnline,
  intl
}: {
  enrichedEvents: {
    enrichedEvent: EventIndex & { title: string | null }
    localEventStatus: EventIndex['status'] | keyof typeof ExtendedEventStatuses
  }[]
  eventConfigs: EventConfig[]
  outbox: OutboxEventIndex[]
  action?: { type: WorkqueueActionType }
  isWideScreen: boolean
  isOnline: boolean
  intl: IntlShape
}) {
  return enrichedEvents.map(({ enrichedEvent, localEventStatus }) => {
    const eventConfig = getEventConfigById(eventConfigs, enrichedEvent.type)

    const actionComponents = buildAvailableActionComponents({
      event: enrichedEvent,
      localEventStatus,
      action,
      isWideScreen
    })

    const outboxMeta = outbox.find((o) => o.id === enrichedEvent.id)?.meta

    const outboxStatusText = intl.formatMessage(
      isOnline ? messages.processingAction : messages.waitingForAction,
      {
        action:
          typeof outboxMeta?.actionType === 'string'
            ? outboxMeta.actionType
            : ''
      }
    )

    const metaLine = [
      intl.formatMessage(eventConfig.label),
      enrichedEvent.trackingId,
      enrichedEvent.dateOfEvent && formatLongDate(enrichedEvent.dateOfEvent)
    ]
      .filter(Boolean)
      .join(' • ')

    return {
      ...enrichedEvent,
      actions: actionComponents,
      label: eventConfig.label,
      type: intl.formatMessage(eventConfig.label),
      createdAt: formattedDuration(new Date(enrichedEvent.createdAt)),
      updatedAt: formattedDuration(new Date(enrichedEvent.updatedAt)),
      status: intl.formatMessage(messages.eventStatus, {
        status: localEventStatus
      }),
      title: (
        <SearchResultItemTitle
          event={enrichedEvent}
          eventConfig={eventConfig}
        />
      ),
      meta: metaLine,
      sent: formattedDuration(new Date(enrichedEvent.updatedAt)),
      // Outbox rows are not navigable; their title is plain text as well
      rowClickable: localEventStatus !== ExtendedEventStatuses.OUTBOX,
      flagsCell:
        localEventStatus === ExtendedEventStatuses.OUTBOX
          ? outboxStatusText
          : getFlagPills(enrichedEvent.flags, eventConfig, intl),
      outbox: outboxStatusText
    }
  })
}
