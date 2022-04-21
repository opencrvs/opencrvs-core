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
import { selectFormDraft } from '@client/forms/configuration/formDrafts/selectors'
import { Event } from '@client/forms'
import { useIntl } from 'react-intl'
import {
  messages,
  draftStatusMessages
} from '@client/i18n/messages/views/formConfig'
import { DraftStatus } from '@client/forms/configuration/formDrafts/reducer'
import { Value, DraftVersion } from './components'
import formatDate from '@client/utils/date-formatting'
import { Pill } from '@opencrvs/components/lib/interface'
import { isDefaultDraft } from './utils'

function EventDrafts({ event }: { event: Event }) {
  const intl = useIntl()
  const formDraft = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )
  const { updatedAt, comment, status, version } = formDraft

  if (status !== DraftStatus.PUBLISHED) {
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
            label={intl.formatMessage(draftStatusMessages.PUBLISHED)}
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
      <EventDrafts event={Event.BIRTH} />
      <EventDrafts event={Event.DEATH} />
    </ListViewSimplified>
  )
}
