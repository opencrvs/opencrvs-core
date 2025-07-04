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
import { Pill, ResponsiveModal, Stack, Table } from '@opencrvs/components'
import { Text } from '@opencrvs/components/lib/Text'
import {
  ActionDocument,
  ActionType,
  ActionUpdate
} from '@opencrvs/commons/client'
import { joinValues } from '@opencrvs/commons/client'
export const eventHistoryStatusMessage = {
  id: `v2.events.history.status`,
  defaultMessage:
    '{status, select, CREATE {Draft} NOTIFY {Notified} VALIDATE {Validated} DRAFT {Draft} DECLARE {Declared} REGISTER {Registered} PRINT_CERTIFICATE {Print certificate} REJECT {Rejected} ARCHIVE {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} READ {Viewed} ASSIGN {Assigned} UNASSIGN {Unassigned} other {Unknown}}'
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
  markAsDuplicate: {
    id: 'v2.event.history.markAsDuplicate',
    defaultMessage: 'Marked as a duplicate'
  }
})

function prepareComments(history: ActionDocument) {
  const comments: { comment: string }[] = []

  if (
    history.type === ActionType.REJECT ||
    history.type === ActionType.ARCHIVE
  ) {
    comments.push({ comment: history.reason.message })
  }

  return comments
}

/**
 * Detailed view of single Action, showing the history of the event.
 *
 * @TODO: Add more details to the modal and ability to diff changes when more events are specified.
 */
export function EventHistoryModal({
  history,
  userName,
  close
}: {
  history: ActionDocument
  userName: string
  close: () => void
}) {
  const intl = useIntl()
  const title = intl.formatMessage(eventHistoryStatusMessage, {
    status: history.type
  })

  const commentsColumn = [
    {
      key: 'comment',
      label: intl.formatMessage(messages.comment),
      width: 100
    }
  ]

  const content = prepareComments(history)

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
                new Date(history.createdAt),
                intl.formatMessage(messages['event.history.modal.timeFormat'])
              )
            ],
            ' — '
          )}
        </Text>
      </Stack>
      {content.length > 0 && (
        <Table columns={commentsColumn} content={content} noResultText=" " />
      )}
      {history.type === ActionType.ARCHIVE && history.reason.isDuplicate && (
        <p>
          <Pill
            label={intl.formatMessage(messages.markAsDuplicate)}
            size="small"
            type="inactive"
          />
        </p>
      )}
    </ResponsiveModal>
  )
}
