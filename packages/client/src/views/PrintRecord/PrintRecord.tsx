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
import { PrintRecordHeader as Header } from '@client/views/PrintRecord/Header'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import { useSelector } from 'react-redux'
import { useParams, Redirect } from 'react-router'
import { IDeclaration } from '@client/declarations'
import styled from 'styled-components'
import {
  createSeparateIntls,
  formatMessage
} from '@client/views/PrintRecord/utils'
import { createIntlCache } from 'react-intl'
import { getLanguages } from '@client/i18n/selectors'
import { PrintRecordBody as Body } from '@client/views/PrintRecord/Body'
import { getOfflineData } from '@client/offline/selectors'
import { messages as reviewMessages } from '@client/i18n/messages/views/review'
import { printRecordMessages } from '@client/i18n/messages/views/printRecord'
import { constantsMessages } from '@client/i18n/messages'

const Container = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  justify-content: center;
`
const Content = styled.div`
  max-width: 1024px;
`
export function PrintRecord() {
  const languages = useSelector(getLanguages)
  const offlineData = useSelector(getOfflineData)
  const cache = createIntlCache()
  const intls = createSeparateIntls(languages, cache)
  const params = useParams<{ declarationId: string }>()
  const { declarationId } = params
  const declaration = useSelector<IStoreState, IDeclaration | undefined>(
    (state) =>
      state.declarationsState.declarations.find(
        ({ id }) => id === declarationId
      )
  )

  if (!declaration) {
    return (
      <Redirect
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyForReview,
          selectorId: ''
        })}
      />
    )
  }

  return (
    <Container>
      <Content>
        <Header
          logoSrc={offlineData.config.COUNTRY_LOGO.file}
          title={formatMessage(intls, reviewMessages.govtName)}
          heading={formatMessage(
            intls,
            printRecordMessages.civilRegistrationCentre
          )}
          subject={formatMessage(
            intls,
            reviewMessages.headerSubjectWithoutName,
            {
              eventType: declaration.event
            }
          )}
          info={
            declaration.data?.registration?.trackingId
              ? {
                  label: formatMessage(intls, constantsMessages.trackingId),
                  value: declaration.data.registration.trackingId as string
                }
              : undefined
          }
        />
        <Body declaration={declaration} intls={intls} />
      </Content>
    </Container>
  )
}
