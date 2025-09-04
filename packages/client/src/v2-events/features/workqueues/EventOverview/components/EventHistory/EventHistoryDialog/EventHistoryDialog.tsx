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
import format from 'date-fns/format'
import { flatten } from 'lodash'
import { ResponsiveModal, Stack, Table } from '@opencrvs/components'
import { Text } from '@opencrvs/components/lib/Text'
import {
  ActionDocument,
  ActionType,
  EventDocument,
  getAcceptedActions,
  UUID
} from '@opencrvs/commons/client'
import { joinValues } from '@opencrvs/commons/client'
import { useActionForHistory } from '@client/v2-events/features/events/actions/correct/useActionForHistory'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { getActionTypeSpecificContent } from './actionTypeSpecificContent'

export const eventHistoryStatusMessage = {
  id: `v2.events.history.status`,
  defaultMessage:
    '{status, select, CREATE {Draft} NOTIFY {Sent incomplete} VALIDATE {Validated} DRAFT {Draft} DECLARE {Sent for review} REGISTER {Registered} PRINT_CERTIFICATE {Certified} REJECT {Rejected} ARCHIVE {Archived} DUPLICATE_DETECTED {Flagged as potential duplicate} MARK_AS_DUPLICATE {Marked as a duplicate} CORRECTED {Record corrected} REQUEST_CORRECTION {Correction requested} APPROVE_CORRECTION {Correction approved} REJECT_CORRECTION {Correction rejected} READ {Viewed} ASSIGN {Assigned} UNASSIGN {Unassigned} other {Unknown}}'
}

const messages = defineMessages({
  'event.history.modal.timeFormat': {
    defaultMessage: 'MMMM dd, yyyy · hh.mm a',
    id: 'v2.configuration.timeFormat',
    description: 'Time format for timestamps in event history'
  },
  comment: {
    defaultMessage: 'Comment',
    description: 'Label for rejection comment',
    id: 'v2.constants.comment'
  },
  reason: {
    defaultMessage: 'Reason',
    description: 'Label for rejection correction reason',
    id: 'v2.constants.reason'
  },
  duplicateOf: {
    defaultMessage: 'Duplicate of',
    description: 'table header for `duplicate of` in record audit',
    id: 'v2.constants.duplicateOf'
  }
})

function prepareComments(history: ActionDocument) {
  const comments: { comment: string }[] = []

  if (
    history.type === ActionType.REJECT ||
    history.type === ActionType.ARCHIVE
  ) {
    comments.push({ comment: history.content.reason })
  }

  return comments
}

function prepareReason(history: ActionDocument) {
  const reason: { message?: string } = {}

  if (history.type === ActionType.REJECT_CORRECTION) {
    reason.message = history.content.reason
  }

  return reason
}

function prepareDuplicateOf(
  history: ActionDocument,
  fullHistory: ActionDocument[]
) {
  if (history.type === ActionType.MARK_AS_DUPLICATE) {
    const duplicateOf = history.content?.duplicateOf
    if (duplicateOf) {
      const duplicateDetectedActions = fullHistory.filter(
        (action) => action.type === ActionType.DUPLICATE_DETECTED
      )
      const allDuplicatesDetectedFlattened = flatten(
        duplicateDetectedActions.map((action) => action.content.duplicates)
      ) satisfies Array<{ id: UUID; trackingId: string }>

      return (
        allDuplicatesDetectedFlattened.find(
          (duplicate) => duplicate.id === duplicateOf
        )?.trackingId ?? null
      )
    }
  }

  return null
}

/**
 * Detailed view of single Action, showing the history of the event.
 */
export function EventHistoryDialog({
  action,
  userName,
  close,
  fullEvent
}: {
  action: ActionDocument
  userName: string
  close: () => void
  fullEvent: EventDocument
}) {
  const intl = useIntl()
  const { getActionTypeForHistory } = useActionForHistory()
  const history = getAcceptedActions(fullEvent)
  const title = intl.formatMessage(eventHistoryStatusMessage, {
    status: getActionTypeForHistory(history, action)
  })
  const events = useEvents()

  const comments = prepareComments(action)
  const reason = prepareReason(action)
  const duplicateOf = prepareDuplicateOf(action, history)

  return (
    <ResponsiveModal
      autoHeight
      actions={[]}
      handleClose={close}
      id="event-history-modal"
      responsive={true}
      show={true}
      title={title}
      width={1024}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg19">
          {joinValues(
            [
              userName,
              format(
                new Date(action.createdAt),
                intl.formatMessage(messages['event.history.modal.timeFormat'])
              )
            ],
            ' — '
          )}
        </Text>
      </Stack>
      {Boolean(duplicateOf) && (
        <Table
          columns={[
            {
              key: 'duplicateOf',
              label: intl.formatMessage(messages.duplicateOf),
              width: 100
            }
          ]}
          content={[
            {
              duplicateOf: duplicateOf
            }
          ]}
          noResultText=" "
        />
      )}
      {comments.length > 0 && (
        <Table
          columns={[
            {
              key: 'comment',
              label: intl.formatMessage(messages.comment),
              width: 100
            }
          ]}
          content={comments}
          noResultText=" "
        />
      )}
      {reason.message && (
        <Table
          columns={[
            {
              key: 'message',
              label: intl.formatMessage(messages.reason),
              width: 100
            }
          ]}
          content={[reason]}
          noResultText=" "
        />
      )}
      {getActionTypeSpecificContent(action, fullEvent)}
    </ResponsiveModal>
  )
}
