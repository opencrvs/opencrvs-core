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
import { PrintRecordHeader as Header } from '@client/views/PrintRecord/Header'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import { useSelector } from 'react-redux'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
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
import { AppBar, Button, Icon } from '@opencrvs/components/lib'

const Container = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  justify-content: center;
`
const Content = styled.div`
  max-width: 1024px;
`

const AvoidBreak = styled.div`
  @media print {
    page-break-after: avoid;
  }
`
const StyledAppBar = styled(AppBar)`
  @media print {
    display: none;
  }
`

export function PrintRecord() {
  const navigate = useNavigate()
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
      <Navigate
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyForReview,
          selectorId: ''
        })}
      />
    )
  }

  return (
    <>
      <StyledAppBar
        desktopRight={
          <Button type="icon" size="small" onClick={() => navigate(-1)}>
            <Icon name="X" />
          </Button>
        }
        mobileRight={
          <Button type="icon" size="small" onClick={() => navigate(-1)}>
            <Icon name="X" />
          </Button>
        }
      />
      <Container>
        <Content>
          <AvoidBreak>
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
          </AvoidBreak>
          <Body declaration={declaration} intls={intls} />
        </Content>
      </Container>
    </>
  )
}
