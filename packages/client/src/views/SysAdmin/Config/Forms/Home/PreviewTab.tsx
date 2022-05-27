/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import React from 'react'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { selectFormDraft } from '@client/forms/configuration/formConfig/selectors'
import { Event } from '@client/forms'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import {
  messages,
  draftStatusMessages
} from '@client/i18n/messages/views/formConfig'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { DraftStatus } from '@client/utils/gateway'
import { Value, DraftVersion } from './components'
import { Pill } from '@opencrvs/components/lib/interface'
import { ActionStatus } from '@client/views/SysAdmin/Config/Forms/utils'
import { ActionContext, Actions } from './ActionsModal'

function ActionButton({
  action,
  event
}: {
  action: Actions.EDIT | Actions.PUBLISH
  event: Event
}) {
  const intl = useIntl()
  const { setAction } = React.useContext(ActionContext)

  return (
    <LinkButton
      id={`${action.toLowerCase()}-btn`}
      onClick={() => {
        setAction({
          action: action,
          event: event,
          status: ActionStatus.MODAL
        })
      }}
    >
      {intl.formatMessage(buttonMessages[action.toLowerCase()])}
    </LinkButton>
  )
}

function EventDrafts({ event }: { event: Event }) {
  const intl = useIntl()
  const formDraft = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )
  const { updatedAt, status, version } = formDraft

  return (
    <ListViewItemSimplified
      key={version}
      label={<DraftVersion event={event} version={version} />}
      value={
        <Value>
          {status === DraftStatus.Draft
            ? intl.formatMessage(messages.defaultComment)
            : intl.formatMessage(messages.previewDate, {
                updatedAt
              })}
        </Value>
      }
      actions={
        status === DraftStatus.Published ? (
          <Pill
            label={intl.formatMessage(
              draftStatusMessages[DraftStatus.Published]
            )}
            type="active"
          />
        ) : (
          <>
            {status === DraftStatus.InPreview && (
              <ActionButton action={Actions.EDIT} event={event} />
            )}
            <ActionButton action={Actions.PUBLISH} event={event} />
          </>
        )
      }
    />
  )
}

export function PreviewTab() {
  return (
    <ListViewSimplified>
      <EventDrafts event={Event.BIRTH} />
      <EventDrafts event={Event.DEATH} />
    </ListViewSimplified>
  )
}
