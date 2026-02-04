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
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { orderBy, first } from 'lodash'
import {
  EventIndex,
  EventConfig,
  deepDropNulls,
  applyDraftToEventIndex,
  CtaActionType
} from '@opencrvs/commons/client'
import { SORT_ORDER } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'

import { CoreWorkqueues } from '../../../../utils'
import { formattedDuration } from '../../../../../utils/date-formatting'
import { DownloadButton } from '../../../../components/DownloadButton'
import { ActionCta } from '../ActionCta'
import RetryButton from '../../../../components/RetryButton'
import { getEventStatus } from './utils'
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

export function buildEventActions(
  event: any,
  actions: CtaActionType[],
  allowRetry: boolean,
  isWideScreen: boolean,
  slug: string,
  isDraft: boolean
) {
  const actionConfigsWithoutDownloadButton = isWideScreen
    ? actions
        .map((actionType) => ({
          actionComponent: (
            <ActionCta
              actionType={actionType}
              event={event}
              redirectParam={slug}
            />
          )
        }))
        .concat(
          allowRetry ? { actionComponent: <RetryButton event={event} /> } : []
        )
    : []

  return actionConfigsWithoutDownloadButton.concat({
    actionComponent: (
      <DownloadButton
        key={`DownloadButton-${event.id}`}
        event={event}
        isDraft={isDraft}
      />
    )
  })
}

export function createEventRow({
  event,
  eventConfig,
  outbox,
  drafts,
  actions,
  allowRetry,
  slug,
  isWideScreen,
  isOnline
}: {
  event: any
  eventConfig: EventConfig
  outbox: any[]
  drafts: any[]
  actions: CtaActionType[]
  allowRetry: boolean
  slug: string
  isWideScreen: boolean
  isOnline: boolean
  navigate: any
  intl: any
}) {
  const intl = useIntl()
  const navigate = useNavigate()

  const { meta, ...eventData } = event

  const status = getEventStatus({
    eventId: eventData.id,
    currentStatus: eventData.status,
    outbox,
    drafts
  })

  const actionConfigs = buildEventActions(
    eventData,
    actions,
    allowRetry,
    isWideScreen,
    slug,
    slug === CoreWorkqueues.DRAFT
  )

  const type = intl.formatMessage(eventConfig.label)

  const handleTitleClick = () => {
    navigate(
      ROUTES.V2.EVENTS.EVENT.buildPath(
        { eventId: eventData.id },
        { workqueue: slug }
      )
    )
  }

  return {
    ...eventData,
    actions: actionConfigs,
    label: eventConfig.label,
    type,
    createdAt: formattedDuration(new Date(eventData.createdAt)),
    updatedAt: formattedDuration(new Date(eventData.updatedAt)),
    status: intl.formatMessage(messages.eventStatus, { status }),
    title: (
      <SearchResultItemTitle
        event={eventData}
        status={status}
        type={type}
        onClick={handleTitleClick}
      />
    ),
    outbox: intl.formatMessage(
      isOnline ? messages.processingAction : messages.waitingForAction,
      { action: typeof meta?.actionType === 'string' ? meta.actionType : '' }
    )
  }
}

export function processEventsToRows({
  events,
  eventConfigs,
  drafts,
  outbox,
  actions,
  allowRetry,
  slug,
  isWideScreen,
  isOnline,
  sortedCol,
  sortOrder,
  getEventTitle,
  intl,
  navigate
}: {
  events: EventIndex[]
  eventConfigs: EventConfig[]
  drafts: any[]
  outbox: any[]
  actions: CtaActionType[]
  allowRetry: boolean
  slug: string
  isWideScreen: boolean
  isOnline: boolean
  sortedCol: string
  sortOrder: (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  getEventTitle: (config: EventConfig, event: EventIndex) => any
  intl: any
  navigate: any
}) {
  const rows = events.map((event) => {
    const eventConfig = eventConfigs.find(({ id }) => id === event.type)
    if (!eventConfig) {
      throw new Error('Event configuration not found for event:' + event.type)
    }

    const draft = first(drafts.filter((d) => d.eventId === event.id))
    const eventWithDraft = draft
      ? deepDropNulls(applyDraftToEventIndex(event, draft, eventConfig))
      : event

    const { useFallbackTitle, title } = getEventTitle(
      eventConfig,
      eventWithDraft
    )
    const processedEvent = { ...eventWithDraft, title, useFallbackTitle }

    return createEventRow({
      event: processedEvent,
      eventConfig,
      outbox,
      drafts,
      actions,
      allowRetry,
      slug,
      isWideScreen,
      isOnline,
      intl,
      navigate
    })
  })

  return orderBy(rows, sortedCol, sortOrder)
}
