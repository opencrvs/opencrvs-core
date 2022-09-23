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
import * as React from 'react'
import { useIntl } from 'react-intl'
import styled from '@client/styledComponents'
import { Header } from '@client/components/interface/Header/Header'
import { ListViewSimplified } from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { userMessages as messages } from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  Name,
  Role,
  Language,
  Password,
  PIN,
  PhoneNumber,
  ProfileImage
} from '@client/views/Settings/items'

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 274px;
    margin-top: 24px;
    margin-right: 24px;
  }
`

export function SettingsPage() {
  const intl = useIntl()
  return (
    <>
      <Header title={intl.formatMessage(messages.settingsTitle)} />
      <Navigation />
      <BodyContainer>
        <Content
          title={intl.formatMessage(messages.settingsTitle)}
          showTitleOnMobile={true}
        >
          <ListViewSimplified>
            <Name />
            <PhoneNumber />
            <Role />
            <Language />
            <Password />
            <PIN />
            <ProfileImage />
          </ListViewSimplified>
        </Content>
      </BodyContainer>
    </>
  )
}
