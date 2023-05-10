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
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { IPrintableDeclaration } from '@client/declarations'
import { selectDeclaration } from '@client/declarations/selectors'
import { constantsMessages } from '@client/i18n/messages'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { goToHomeTab } from '@client/navigation'
import { IStoreState } from '@client/store'
import { AppBar, Frame, Icon } from '@opencrvs/components/lib'
import { Button } from '@opencrvs/components/lib/Button'
import React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { IssueCollectorForm } from './IssueCollectorForm/IssueCollectorForm'
import { IssueCollectorFormForOthers } from './IssueCollectorForm/IssueFormForOthers'

export function IssueCertificate() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const { pageId, registrationId } = useParams<{
    registrationId: string
    pageId: string
  }>()

  const declaration = useSelector((store: IStoreState) =>
    selectDeclaration(store, registrationId)
  ) as IPrintableDeclaration

  return (
    <Frame
      header={
        <AppBar
          mobileTitle={intl.formatMessage(issueMessages.issueCertificate)}
          mobileLeft={<HistoryNavigator hideForward={true} />}
          mobileRight={
            <Button
              size="medium"
              type="icon"
              onClick={() => dispatch(goToHomeTab(WORKQUEUE_TABS.readyToIssue))}
            >
              <Icon name={'X'} weight={'bold'} />
            </Button>
          }
          desktopTitle={intl.formatMessage(issueMessages.issueCertificate)}
          desktopLeft={<HistoryNavigator hideForward={true} />}
          desktopRight={
            <Button
              size="medium"
              type="icon"
              onClick={() => dispatch(goToHomeTab(WORKQUEUE_TABS.readyToIssue))}
            >
              <Icon name={'X'} weight={'bold'} />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {pageId === 'collector' ? (
        <IssueCollectorForm declaration={declaration} />
      ) : (
        <IssueCollectorFormForOthers declaration={declaration} />
      )}
    </Frame>
  )
}
