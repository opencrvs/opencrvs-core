import * as React from 'react'
import styled from 'styled-components'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { IUserDetails } from '@register/utils/userUtils'
import { createNamesMap } from '@register/utils/data-formatting'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { LightLogo } from '@opencrvs/components/lib/icons'
import { roleMessages, typeMessages } from '@register/utils/roleTypeMessages'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const Page = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
`
const Container = styled.div`
  position: relative;
  height: auto;
  padding: 0px;
  margin: 125px auto 0px auto;
  max-width: 460px;
`
const LogoContainer = styled.div`
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

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  welcomeTitle: {
    id: 'userSetup.landing.title',
    defaultMessage: 'Welcome to OpenCRVS',
    description: 'Title for the landing page'
  },
  instruction: {
    id: 'userSetup.landing.instruction',
    defaultMessage:
      'You just a few steps away from completing your account set up.',
    description: 'Instruction for the account setup'
  },
  startButtonLabel: {
    id: 'userSetup.landing.button.start',
    defaultMessage: 'Start',
    description: 'Label of start button'
  }
})

export class UserSetupView extends React.Component<
  { userDetails: IUserDetails | null } & InjectedIntlProps
> {
  render() {
    const { intl, userDetails } = this.props
    return (
      <Page>
        <Container id="user-setup-landing-page">
          <LogoContainer>
            <LightLogo />
          </LogoContainer>
          <TitleHolder>{intl.formatMessage(messages.welcomeTitle)}</TitleHolder>
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
                      typeMessages[userDetails.type as string]
                    )} - ${intl.formatMessage(
                      roleMessages[userDetails.role as string]
                    )}`
                  : `${intl.formatMessage(
                      roleMessages[userDetails.role as string]
                    )}`)) ||
                ''}
            </RoleHolder>
          </InfoHolder>
          <InstructionHolder>
            {intl.formatMessage(messages.instruction)}
          </InstructionHolder>
          <NextButton id="user-setup-start-button">
            {intl.formatMessage(messages.startButtonLabel)}
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
