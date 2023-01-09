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
import { PINKeypad } from '@opencrvs/components/lib/PINKeypad'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import styled from '@client/styledComponents'
import * as bcrypt from 'bcryptjs'
import { storage } from '@opencrvs/client/src/storage'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { messages } from '@client/i18n/messages/views/pin'
import * as ReactDOM from 'react-dom'
import { getCurrentUserID, IUserData } from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { Toast } from '@opencrvs/components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
`
const BoxWrapper = styled.div`
  text-align: center;
  border-radius: 4px;
  padding: 24px;
  width: min(500px, 90%);

  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
`

const TitleText = styled.span`
  display: flex;
  justify-content: center;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.h2};
  text-align: center;
  margin-top: 24px;
  margin-bottom: 16px;
  @media (max-height: 780px) {
    ${({ theme }) => theme.fonts.h3};
    margin-top: 0.3em;
    margin-bottom: 0.3em;
  }
`

const DescriptionText = styled.span`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.reg18};
  text-align: center;
  max-width: 360px;
  margin-bottom: 40px;
  @media (max-height: 780px) {
    ${({ theme }) => theme.fonts.reg16};
  }
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

type IProps = IntlShapeProps & {
  onComplete: () => void
  offlineCountryConfiguration: IOfflineData
}

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
    const d = pin.split('').map((i) => Number(i))
    return d[0] + 1 === d[1] && d[1] + 1 === d[2] && d[2] + 1 === d[3]
  }

  storePINForUser = async (pin: string) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(pin, salt)

    const currentUserID = await getCurrentUserID()
    const userData = (await storage.getItem('USER_DATA')) || '[]'
    const allUserData = JSON.parse(userData) as IUserData[]
    const currentUserData = allUserData.find(
      (user) => user.userID === currentUserID
    )
    if (currentUserData) {
      currentUserData.userPIN = hash
    } else {
      allUserData.push({
        userID: currentUserID,
        userPIN: hash,
        declarations: []
      })
    }
    await storage.setItem('USER_DATA', JSON.stringify(allUserData))
    this.props.onComplete()
  }

  render() {
    const { pin, pinMatchError, pinHasSameDigits, pinHasSeqDigits, refresher } =
      this.state
    const { intl, offlineCountryConfiguration } = this.props

    return (
      <Container
        color={`#${offlineCountryConfiguration.config.LOGIN_BACKGROUND.backgroundColor}`}
        style={{
          backgroundImage: `url(${offlineCountryConfiguration.config.LOGIN_BACKGROUND.backgroundImage})`
        }}
      >
        <BoxWrapper>
          <LogoContainer>
            <CountryLogo
              src={offlineCountryConfiguration.config.COUNTRY_LOGO.file}
            />
          </LogoContainer>
          {pin === null && !pinHasSeqDigits && !pinHasSameDigits && (
            <>
              <TitleText id="title-text">
                {intl.formatMessage(messages.createTitle)}
              </TitleText>
              <DescriptionText id="description-text">
                {intl.formatMessage(messages.createDescription)}
              </DescriptionText>
              {pinMatchError && (
                <Toast
                  type="error"
                  id="errorMsg"
                  onClose={() => {
                    this.setState({ pinMatchError: false })
                  }}
                >
                  {intl.formatMessage(messages.pinMatchError)}
                </Toast>
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
              <Toast
                type="error"
                id="errorMsg"
                onClose={() => {
                  this.setState({ pinHasSeqDigits: false })
                }}
              >
                {intl.formatMessage(messages.pinSequentialDigitsError)}
              </Toast>
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
              <Toast
                type="error"
                id="errorMsg"
                onClose={() => {
                  this.setState({ pinHasSameDigits: false })
                }}
              >
                {intl.formatMessage(messages.pinSameDigitsError)}
              </Toast>
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
        </BoxWrapper>
      </Container>
    )
  }

  componentDidUpdate = () => this.focusKeypad()

  componentDidMount = () => {
    document.addEventListener('mouseup', this.handleClick, false)
    this.focusKeypad()
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleClick, false)
  }

  handleClick = (e: Event) => {
    this.focusKeypad()
  }

  focusKeypad = () => {
    const node =
      this.pinKeyRef && (ReactDOM.findDOMNode(this.pinKeyRef) as HTMLElement)
    if (node) {
      node.focus()
    }
  }
}

export const CreatePin = connect((store: IStoreState) => ({
  offlineCountryConfiguration: getOfflineData(store)
}))(injectIntl(CreatePinComponent))
