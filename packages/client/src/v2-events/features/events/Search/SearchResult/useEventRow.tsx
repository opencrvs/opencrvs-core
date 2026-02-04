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
import { defineMessages, IntlShape } from 'react-intl'
import { first } from 'lodash'
import {
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
import { ExtendedEventStatuses, getLocalEventStatus } from './utils'
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
  const actionConfigsWithoutDownloadButton = isWideScreen
    ? actions
        .map((actionType) => ({
          actionComponent: (
            <ActionCta
              actionType={actionType}
              event={event}
              redirectParam={redirectParam}
            />
          )
        }))
        .concat(
          localEventStatus === ExtendedEventStatuses.OUTBOX
            ? { actionComponent: <RetryButton event={event} /> }
            : []
        )
    : []

  return actionConfigsWithoutDownloadButton.concat({
    actionComponent: (
      <DownloadButton
        key={`DownloadButton-${event.id}`}
        event={event}
        isDraft={localEventStatus === ExtendedEventStatuses.DRAFT}
      />
    )
  })
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
