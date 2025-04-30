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
import { AppBar, Frame, Icon } from '@opencrvs/components/lib'
import { Button } from '@opencrvs/components/lib/Button'
import { constantsMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { IPrintableDeclaration } from '@client/declarations'
import { useDeclaration } from '@client/declarations/selectors'
import { IssueCollectorForm } from './IssueCollectorForm/IssueCollectorForm'
import { formatUrl, generateGoToHomeTabUrl } from '@client/navigation'
import { IssueCollectorFormForOthers } from './IssueCollectorForm/IssueFormForOthers'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'

export function IssueCertificate() {
  const navigate = useNavigate()
  const intl = useIntl()

  const { pageId, registrationId } = useParams<{
    registrationId: string
    pageId: string
  }>()

  const declaration = useDeclaration<IPrintableDeclaration | undefined>(
    registrationId
  )

  if (!declaration) {
    return (
      <Navigate
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyToIssue,
          selectorId: ''
        })}
      />
    )
  }

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
              onClick={() =>
                navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyToIssue
                  })
                )
              }
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
              onClick={() =>
                navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyToIssue
                  })
                )
              }
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
