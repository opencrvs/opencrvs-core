import * as React from 'react'
import styled from 'styled-components'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { IUserDetails } from '@register/utils/userUtils'
import { createNamesMap } from '@register/utils/data-formatting'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { LightLogo } from '@opencrvs/components/lib/icons'
import { userMessages, buttonMessages } from '@register/i18n/messages'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData
} from '@register/components/ProtectedAccount'
import { messages } from '@register/i18n/messages/views/userSetup'

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
  ${({ theme }) => theme.fonts.h2Style};
  padding-top: 40px;
`
const InfoHolder = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 12px 0px;
  margin: 20px 0px;
`
const NameHolder = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
`
const RoleHolder = styled.div`
  ${({ theme }) => theme.fonts.captionStyle};
  padding-top: 12px;
`
const InstructionHolder = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 40px 65px 30px 65px;
`
const NextButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

interface IUserSetupPageProp {
  userDetails: IUserDetails | null
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}
export class UserSetupView extends React.Component<
  IUserSetupPageProp & IntlShapeProps
> {
  render() {
    const { intl, userDetails, goToStep } = this.props

    return (
      <Page>
        <Container id="user-setup-landing-page">
          <LogoContainer>
            <LightLogo />
          </LogoContainer>
          <TitleHolder>
            {intl.formatMessage(messages.userSetupWelcomeTitle)}
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

export const UserSetupPage = connect(
  function mapStateToProps(state: IStoreState) {
    return {
      userDetails: getUserDetails(state)
    }
  },
  null
)(injectIntl(UserSetupView))
