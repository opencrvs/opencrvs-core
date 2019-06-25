import * as React from 'react'
import styled from 'styled-components'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { IUserDetails } from '@register/utils/userUtils'
import { LightLogo } from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { redirectToAuthentication } from '@register/profile/profileActions'

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
  padding: 50px 65px 0px 65px;
`
const InstructionHolder = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 40px 60px 30px 60px;
`
const NextButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  setupCompleteTitle: {
    id: 'userSetup.complete.title',
    defaultMessage: 'Account setup complete',
    description: 'Title for the setup complete page'
  },
  instruction: {
    id: 'userSetup.complete.instruction',
    defaultMessage:
      'Now login to your account with your user name and newly created password',
    description: 'Instruction for the setup complete'
  },
  loginButtonLabel: {
    id: 'userSetup.complete.button.login',
    defaultMessage: 'Login',
    description: 'Label of login button'
  }
})

export class SetupConfirmationView extends React.Component<
  {
    redirectToAuthentication: typeof redirectToAuthentication
  } & InjectedIntlProps
> {
  render() {
    const { intl } = this.props
    return (
      <Page>
        <Container id="user-setup-complete-page">
          <LogoContainer>
            <LightLogo />
          </LogoContainer>
          <TitleHolder>
            {intl.formatMessage(messages.setupCompleteTitle)}
          </TitleHolder>
          <InstructionHolder>
            {intl.formatMessage(messages.instruction)}
          </InstructionHolder>
          <NextButton
            id="setup-login-button"
            onClick={() => this.props.redirectToAuthentication()}
          >
            {intl.formatMessage(messages.loginButtonLabel)}
          </NextButton>
        </Container>
      </Page>
    )
  }
}

export const SetupConfirmationPage = connect(
  null,
  {
    redirectToAuthentication
  }
)(injectIntl(SetupConfirmationView))
