import * as React from 'react'
import { PINKeypad } from '@opencrvs/components/lib/interface'
import { PIN } from '@opencrvs/components/lib/icons'
import styled from '@register/styledComponents'
import * as bcrypt from 'bcryptjs'
import { storage } from '@opencrvs/register/src/storage'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import messages from '@register/views/PIN/messages'
import * as ReactDOM from 'react-dom'
import { getCurrentUserID, IUserData } from '@register/applications'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.gradients.gradientNightshade};
  height: 100vh;
  width: 100%;
  position: absolute;
  overflow-y: hidden;
  overflow-x: hidden;
`

const TitleText = styled.span`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.h4Style};
  text-align: center;
  margin-top: 24px;
  margin-bottom: 16px;
`

const DescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bigBodyStyle};
  text-align: center;
  max-width: 360px;
  margin-bottom: 40px;
`

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bodyStyle};
  background: ${({ theme }) => theme.colors.error};
  height: 40px;
  width: 360px;
  margin-top: -20px;
`

type IProps = InjectedIntlProps & { onComplete: () => void }

class CreatePinComponent extends React.Component<IProps> {
  pinKeyRef: any

  state = {
    pin: null,
    pinMatchError: false,
    pinHasSameDigits: false,
    pinHasSeqDigits: false,
    refresher: false
  }

  firstPINEntry = (pin: string) => {
    this.setState({ refresher: !this.state.refresher })
    const sameDigits = this.sameDigits(pin)
    const seqDigits = this.sequential(pin)
    if (sameDigits || seqDigits) {
      this.setState({
        pinHasSameDigits: sameDigits,
        pinHasSeqDigits: seqDigits
      })
    } else {
      this.setState({ pin, pinHasSameDigits: false, pinHasSeqDigits: false })
    }
  }

  secondPINEntry = (pin: string) => {
    const { pin: firstEnteredPIN } = this.state
    if (pin !== firstEnteredPIN) {
      this.setState({ pinMatchError: true, pin: null })
      return
    }

    this.storePINForUser(pin)
  }

  sameDigits = (pin: string) => pin && Number(pin) % 1111 === 0

  sequential = (pin: string) => {
    const d = pin.split('').map(i => Number(i))
    return d[0] + 1 === d[1] && d[1] + 1 === d[2] && d[2] + 1 === d[3]
  }

  storePINForUser = async (pin: string) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(pin, salt)

    // TODO: this should be moved to the user object when the support for multiple user has been added
    const currentUserID = await getCurrentUserID()

    const userData = (await storage.getItem('USER_DATA')) || '[]'
    const allUserData = JSON.parse(userData) as IUserData[]
    const currentUserData = allUserData.find(
      user => user.userID === currentUserID
    )
    if (currentUserData) {
      currentUserData.userPIN = hash
    } else {
      allUserData.push({
        userID: currentUserID,
        userPIN: hash,
        applications: []
      })
    }
    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
    this.props.onComplete()
  }

  render() {
    const {
      pin,
      pinMatchError,
      pinHasSameDigits,
      pinHasSeqDigits,
      refresher
    } = this.state
    const { intl } = this.props

    return (
      <Container>
        <PIN />
        {pin === null && !pinHasSeqDigits && !pinHasSameDigits && (
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
            <PINKeypad
              pin=""
              ref={(elem: any) => (this.pinKeyRef = elem)}
              onComplete={this.firstPINEntry}
            />
          </>
        )}
        {pinHasSeqDigits && (
          <>
            <TitleText id="title-text">
              {intl.formatMessage(messages.createTitle)}
            </TitleText>
            <DescriptionText id="description-text">
              {intl.formatMessage(messages.createDescription)}
            </DescriptionText>
            <ErrorBox id="error-text">
              {intl.formatMessage(messages.pinSequentialDigitsError)}
            </ErrorBox>
            <PINKeypad
              onComplete={this.firstPINEntry}
              key={refresher.toString()}
            />
          </>
        )}
        {pinHasSameDigits && (
          <>
            <TitleText id="title-text">
              {intl.formatMessage(messages.createTitle)}
            </TitleText>
            <DescriptionText id="description-text">
              {intl.formatMessage(messages.createDescription)}
            </DescriptionText>
            <ErrorBox id="error-text">
              {intl.formatMessage(messages.pinSameDigitsError)}
            </ErrorBox>
            <PINKeypad
              ref={(elem: any) => (this.pinKeyRef = elem)}
              onComplete={this.firstPINEntry}
              key={refresher.toString()}
            />
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

            <PINKeypad
              ref={(elem: any) => (this.pinKeyRef = elem)}
              onComplete={this.secondPINEntry}
            />
          </>
        )}
      </Container>
    )
  }

  componentDidUpdate = () => this.focusKeypad()

  componentDidMount = () => this.focusKeypad()

  focusKeypad = () => {
    const node =
      this.pinKeyRef && (ReactDOM.findDOMNode(this.pinKeyRef) as HTMLElement)
    if (node) {
      node.focus()
    }
  }
}

export const CreatePin = injectIntl(CreatePinComponent)
