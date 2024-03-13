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
import * as React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { redirectToAuthentication } from '@client/profile/profileActions'
import {
  Page,
  Container,
  LogoContainer
} from '@client/views/UserSetup/UserSetupPage'
import { storage } from '@client/storage'
import { USER_DETAILS } from '@client/utils/userUtils'
import { messages } from '@client/i18n/messages/views/userSetup'
import { buttonMessages } from '@client/i18n/messages'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'

const TitleHolder = styled.div`
  ${({ theme }) => theme.fonts.h1};
  padding: 50px 65px 0px 65px;
`
const InstructionHolder = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  padding: 40px 60px 30px 60px;
`
const LoginButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export function SetupConfirmationPage() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfig = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  React.useEffect(() => {
    const removeItemFromStorage = async () => {
      await storage.removeItem(USER_DETAILS)
    }
    removeItemFromStorage()
  }, [])
  return (
    <Page>
      <Container id="user-setup-complete-page">
        <Content size={ContentSize.LARGE}>
          <LogoContainer>
            <CountryLogo src={offlineCountryConfig.config.COUNTRY_LOGO.file} />
          </LogoContainer>
          <TitleHolder>
            {intl.formatMessage(messages.setupCompleteTitle)}
          </TitleHolder>
          <InstructionHolder>
            {intl.formatMessage(messages.userSetupInstruction)}
          </InstructionHolder>
          <LoginButton
            id="setup-login-button"
            onClick={() => dispatch(redirectToAuthentication())}
          >
            {intl.formatMessage(buttonMessages.login)}
          </LoginButton>
        </Content>
      </Container>
    </Page>
  )
}
