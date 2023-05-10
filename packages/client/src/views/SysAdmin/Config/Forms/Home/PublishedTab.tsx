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
import { selectFormDraft } from '@client/forms/configuration/formConfig/selectors'
import {
  draftStatusMessages,
  messages
} from '@client/i18n/messages/views/formConfig'
import { IStoreState } from '@client/store'
import { DraftStatus, Event } from '@client/utils/gateway'
import { isDefaultDraft } from '@client/views/SysAdmin/Config/Forms/utils'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Pill } from '@opencrvs/components/lib/Pill'
import React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { DraftVersion, Value } from './components'

function EventDrafts({ event }: { event: Event }) {
  const intl = useIntl()
  const formDraft = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )
  const { updatedAt, comment, status, version } = formDraft

  if (status !== DraftStatus.Published) {
    return <></>
  }

  return (
    <>
      <ListViewItemSimplified
        key={version}
        label={<DraftVersion event={event} version={version} />}
        value={
          <Value>
            {isDefaultDraft(formDraft)
              ? comment
              : intl.formatMessage(messages.publishedDate, {
                  updatedAt
                })}
          </Value>
        }
        actions={
          <Pill
            label={intl.formatMessage(
              draftStatusMessages[DraftStatus.Published]
            )}
            type="active"
          />
        }
      />
    </>
  )
}

export function PublishedTab() {
  return (
    <ListViewSimplified>
      <EventDrafts event={Event.Birth} />
      <EventDrafts event={Event.Death} />
    </ListViewSimplified>
  )
}
