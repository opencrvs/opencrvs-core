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
import { AppBar, Frame } from '@opencrvs/components/lib'
import { constantsMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { useParams } from 'react-router'
import { IPrintableDeclaration } from '@client/declarations'
import { useSelector } from 'react-redux'
import { selectDeclaration } from '@client/declarations/selectors'
import { IStoreState } from '@client/store'
import { IssueCollectorForm } from './IssueCollectorForm/IssueCollectorForm'

export function IssueCertificate() {
  const intl = useIntl()
  const { pageId, registrationId } = useParams<{
    registrationId: string
    pageId: string
  }>()

  const declaration = useSelector((store: IStoreState) =>
    selectDeclaration(store, registrationId)
  ) as IPrintableDeclaration

  return (
    <Frame
      header={<AppBar desktopLeft={<HistoryNavigator />} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {pageId === 'collector' ? (
        <IssueCollectorForm declaration={declaration} />
      ) : (
        <></>
      )}
    </Frame>
  )
}
