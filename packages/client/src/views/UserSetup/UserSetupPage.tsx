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
import styled from 'styled-components'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { IUserDetails } from '@client/utils/userUtils'
import { createNamesMap } from '@client/utils/data-formatting'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { userMessages, buttonMessages } from '@client/i18n/messages'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData
} from '@client/components/ProtectedAccount'
import { messages } from '@client/i18n/messages/views/userSetup'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { CountryLogo } from '@opencrvs/components/lib/icons'

export const Page = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
`
export const Container = styled.div`
  position: relative;
  height: auto;
  padding: 0px;
  margin: 125px auto 0px auto;
  max-width: 460px;
`
export const LogoContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`
const TitleHolder = styled.div`
  ${({ theme }) => theme.fonts.h1};
  padding-top: 40px;
`
const InfoHolder = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 12px 0px;
  margin: 20px 0px;
`
const NameHolder = styled.div`
  ${({ theme }) => theme.fonts.h2};
`
const RoleHolder = styled.div`
  ${({ theme }) => theme.fonts.reg12};
  padding-top: 12px;
`
const InstructionHolder = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  padding: 40px 65px 30px 65px;
`
const NextButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

interface IOwnProps {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}

interface IStateData {
  userDetails: IUserDetails | null
  offlineCountryConfig: IOfflineData
}

type IUserSetupPageProp = IOwnProps & IStateData

export class UserSetupView extends React.Component<
  IUserSetupPageProp & IntlShapeProps
> {
  render() {
    const { intl, userDetails, goToStep, offlineCountryConfig } = this.props

    return (
      <Page>
        <Container id="user-setup-landing-page">
          <LogoContainer>
            <CountryLogo src={offlineCountryConfig.config.COUNTRY_LOGO.file} />
          </LogoContainer>
          <TitleHolder>
            {intl.formatMessage(messages.userSetupWelcomeTitle, {
              applicationName: offlineCountryConfig.config.APPLICATION_NAME
            })}
          </TitleHolder>
          <InfoHolder>
            <NameHolder id="user-setup-name-holder">
              {(userDetails &&
                userDetails.name &&
                (createNamesMap(userDetails.name as GQLHumanName[])[
                  intl.locale
                ] as string)) ||
                ''}
            </NameHolder>
            <RoleHolder id="user-setup-role-holder">
              {(userDetails &&
                (userDetails.type
                  ? `${intl.formatMessage(
                      userMessages[userDetails.type as string]
                    )} - ${intl.formatMessage(
                      userMessages[userDetails.role as string]
                    )}`
                  : `${intl.formatMessage(
                      userMessages[userDetails.role as string]
                    )}`)) ||
                ''}
            </RoleHolder>
          </InfoHolder>
          <InstructionHolder>
            {intl.formatMessage(messages.userSetupIntroduction)}
          </InstructionHolder>
          <NextButton
            id="user-setup-start-button"
            onClick={() =>
              goToStep(ProtectedAccoutStep.PASSWORD, {
                ...this.props.setupData,
                userId: (userDetails && userDetails.userMgntUserID) || ''
              })
            }
          >
            {intl.formatMessage(buttonMessages.start)}
          </NextButton>
        </Container>
      </Page>
    )
  }
}

export const UserSetupPage = connect<IStateData, {}, IOwnProps, IStoreState>(
  (state: IStoreState) => {
    return {
      userDetails: getUserDetails(state),
      offlineCountryConfig: getOfflineData(state)
    }
  }
)(injectIntl(UserSetupView))
