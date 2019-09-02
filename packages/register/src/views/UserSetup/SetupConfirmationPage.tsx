import * as React from 'react'
import styled from 'styled-components'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { LightLogo } from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { redirectToAuthentication } from '@register/profile/profileActions'
import {
  Page,
  Container,
  LogoContainer
} from '@register/views/UserSetup/UserSetupPage'
import { storage } from '@register/storage'
import { USER_DETAILS } from '@register/utils/userUtils'
import { messages } from '@register/i18n/messages/views/userSetup'
import { buttonMessages } from '@register/i18n/messages'

const TitleHolder = styled.div`
  ${({ theme }) => theme.fonts.h2Style};
  padding: 50px 65px 0px 65px;
`
const InstructionHolder = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 40px 60px 30px 60px;
`
const LoginButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export class SetupConfirmationView extends React.Component<
  {
    redirectToAuthentication: typeof redirectToAuthentication
  } & IntlShapeProps
> {
  async componentDidMount() {
    await storage.removeItem(USER_DETAILS)
  }
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
            {intl.formatMessage(messages.userSetupInstruction)}
          </InstructionHolder>
          <LoginButton
            id="setup-login-button"
            onClick={() => this.props.redirectToAuthentication()}
          >
            {intl.formatMessage(buttonMessages.login)}
          </LoginButton>
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
