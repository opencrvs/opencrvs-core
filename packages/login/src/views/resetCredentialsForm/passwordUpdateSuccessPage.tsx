import { goToHome } from '@login/login/actions'
import { storage } from '@login/storage'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { LightLogo } from '@opencrvs/components/lib/icons'
import {
  Container,
  LogoContainer,
  Page
} from '@login/views/resetCredentialsForm/commons'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { messages } from './resetCredentialsForm'

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

export class PasswordUpdateSuccessView extends React.Component<
  { goToHome: typeof goToHome } & IntlShapeProps
> {
  async componentDidMount() {
    await storage.removeItem('USER_DETAILS')
  }
  render() {
    const { intl, goToHome } = this.props
    return (
      <Page>
        <Container id="password-update-success-page">
          <LogoContainer>
            <LightLogo />
          </LogoContainer>
          <TitleHolder>
            {intl.formatMessage(messages.passwordUpdateSuccessPageTitle)}
          </TitleHolder>
          <InstructionHolder>
            {intl.formatMessage(messages.passwordUpdateSuccessPageSubtitle)}
          </InstructionHolder>
          <LoginButton id="login-button" onClick={goToHome}>
            {intl.formatMessage(messages.loginButtonLabel)}
          </LoginButton>
        </Container>
      </Page>
    )
  }
}

export const PasswordUpdateSuccessPage = connect(
  null,
  {
    goToHome
  }
)(injectIntl(PasswordUpdateSuccessView))
