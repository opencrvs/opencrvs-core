import * as React from 'react'
import { PINKeypad } from '@opencrvs/components/lib/interface'
import { PIN } from '@opencrvs/components/lib/icons'
import styled from 'styled-components'
import * as bcrypt from 'bcryptjs'
import { storage } from '@opencrvs/register/src/storage'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import messages from './messages'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    `linear-gradient(180deg, ${theme.colors.headerGradientDark} 0%, ${
      theme.colors.headerGradientLight
    } 100%)`};
  height: 100vh;
  overflow-y: hidden;
  overflow-x: hidden;
`

const TitleText = styled.span`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.boldFont};
  text-align: center;
  font-size: 24px;
  margin-top: 24px;
  margin-bottom: 16px;
`

const DescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  text-align: center;
  font-size: 18px;
  max-width: 360px;
  margin-bottom: 40px;
`

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  background: ${({ theme }) => theme.colors.danger};
  height: 40px;
  width: 360px;
  margin-top: -30px;
  margin-bottom: -10px;
`

type IProps = InjectedIntlProps & { onComplete: () => void }

class CreatePinComponent extends React.Component<IProps> {
  state = { pin: null, pinMatchError: false }

  firstPINEntry = (pin: string) => {
    this.setState({ pin })
  }

  secondPINEntry = (pin: string) => {
    const { pin: firstEnteredPIN } = this.state
    if (pin !== firstEnteredPIN) {
      this.setState({ pinMatchError: true, pin: null })
      return
    }

    this.storePINForUser(pin)
  }

  storePINForUser = async (pin: string) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(pin, salt)

    // TODO: this should be moved to the user object when the support for multiple user has been added
    await storage.setItem('pin', hash)

    this.props.onComplete()
  }

  render() {
    const { pin, pinMatchError } = this.state
    const { intl } = this.props

    return (
      <Container>
        <PIN />
        {pin === null && (
          <>
            <TitleText id="title-text">
              {intl.formatMessage(messages.createTitle)}
            </TitleText>
            <DescriptionText id="description-text">
              {intl.formatMessage(messages.createDescription)}
            </DescriptionText>
            {pinMatchError && (
              <ErrorBox id="error-text">
                {intl.formatMessage(messages.pinMatchError)}
              </ErrorBox>
            )}
            <PINKeypad onComplete={this.firstPINEntry} />
          </>
        )}
        {pin && (
          <>
            <TitleText id="title-text">
              {intl.formatMessage(messages.reEnterTitle)}
            </TitleText>
            <DescriptionText id="description-text">
              {intl.formatMessage(messages.reEnterDescription)}
            </DescriptionText>
            <PINKeypad onComplete={this.secondPINEntry} />
          </>
        )}
      </Container>
    )
  }
}

export const CreatePin = injectIntl(CreatePinComponent)
