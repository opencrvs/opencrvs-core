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
import * as ReactDOM from 'react-dom'

import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { messages } from '@client/i18n/messages/views/pin'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { getUserName } from '@client/utils/userUtils'
import { User } from '@client/utils/gateway'
import { pinValidator } from '@client/views/Unlock/ComparePINs'
import { PINKeypad } from '@opencrvs/components/lib/PINKeypad'
import {
  injectIntl,
  useIntl,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { buttonMessages, userMessages } from '@client/i18n/messages'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import { AvatarLarge } from '@client/components/Avatar'
import { Button } from '@opencrvs/components/lib/Button'
import { Box, Link, Stack, Text, Toast } from '@opencrvs/components'
import { Icon } from '@opencrvs/components/lib/Icon'

import { BackgroundWrapper } from '@client/views/common/Common'

interface IState {
  pin: string
  resetKey: number
}

type ErrorState = {
  attempt: number
  errorMessage: string
}
type IFullState = IState & ErrorState

type Props = {
  userDetails: User | null
  redirectToAuthentication: typeof redirectToAuthentication
}
type IFullProps = Props &
  IntlShapeProps & {
    onCorrectPinMatch: () => void
    onForgetPin: () => void
  }

const MAX_LOCK_TIME = 1
const MAX_ALLOWED_ATTEMPT = 3

export const EnterPinLabel = () => {
  const intl = useIntl()
  return (
    <Text element="h3" variant="h3">
      {intl.formatMessage(userMessages.enterPinLabel)}
    </Text>
  )
}

class UnlockView extends React.Component<IFullProps, IFullState> {
  pinKeyRef: any

  constructor(props: IFullProps) {
    super(props)
    this.state = {
      attempt: 0,
      errorMessage: '',
      pin: '',
      resetKey: Date.now()
    }
  }

  componentDidMount() {
    this.screenLockTimer()
    document.addEventListener('mouseup', this.handleClick, false)
    this.focusKeypad()
  }

  showErrorMessage() {
    return (
      this.state.errorMessage && (
        <Toast
          type="error"
          id="errorMsg"
          onClose={() => this.setState({ errorMessage: '' })}
        >
          {this.state.errorMessage}
        </Toast>
      )
    )
  }

  onPinProvided = async (pin: string) => {
    const { intl } = this.props
    const pinMatched = await pinValidator.isValidPin(pin)

    if (this.state.attempt > MAX_ALLOWED_ATTEMPT) {
      return
    }

    if (this.state.attempt === MAX_ALLOWED_ATTEMPT && !pinMatched) {
      await storage.setItem(SECURITY_PIN_EXPIRED_AT, Date.now().toString())
      this.setState((prevState) => {
        return {
          attempt: prevState.attempt + 1
        }
      })
      this.screenLockTimer()
      return
    }

    if (this.state.attempt < MAX_ALLOWED_ATTEMPT - 1 && !pinMatched) {
      this.setState((preState) => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.incorrect),
        resetKey: Date.now()
      }))
      return
    }

    if (this.state.attempt === MAX_ALLOWED_ATTEMPT - 1 && !pinMatched) {
      this.setState((preState) => ({
        attempt: preState.attempt + 1,
        errorMessage: intl.formatMessage(messages.lastTry),
        resetKey: Date.now()
      }))
      return
    }

    if (pinMatched) {
      this.setState(() => ({
        errorMessage: ''
      }))
      this.props.onCorrectPinMatch()
      return
    }
  }

  screenLockTimer = async () => {
    const { intl } = this.props
    const lockedAt = await storage.getItem(SECURITY_PIN_EXPIRED_AT)
    if (lockedAt) {
      const intervalID = setInterval(() => {
        const currentTime = Date.now()
        const timeDiff = differenceInMinutes(
          currentTime,
          parseInt(lockedAt, 10)
        )
        if (timeDiff < MAX_LOCK_TIME) {
          if (this.state.attempt === MAX_ALLOWED_ATTEMPT + 2) {
            return
          }
          this.setState((prevState) => ({
            attempt: MAX_ALLOWED_ATTEMPT + 2,
            errorMessage: intl.formatMessage(messages.locked)
          }))
        } else {
          clearInterval(intervalID)
          storage.setItem(SECURITY_PIN_EXPIRED_AT, '')
          this.setState(() => ({
            attempt: 0,
            errorMessage: '',
            resetKey: Date.now()
          }))
        }
      }, 100)
    }
  }

  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    storage.removeItem(SECURITY_PIN_EXPIRED_AT)
    this.props.redirectToAuthentication()
  }

  componentDidUpdate = () => this.focusKeypad()

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

  render() {
    const { userDetails } = this.props
    return (
      <BackgroundWrapper id="unlockPage">
        <Box id="Box" onClick={this.focusKeypad}>
          <Stack direction="row" justifyContent="flex-end">
            <Button type="icon" onClick={this.logout} id="logout">
              <Icon name="LogOut" />
            </Button>
          </Stack>

          <Stack direction="column" justifyContent="stretch">
            <AvatarLarge
              name={getUserName(userDetails)}
              avatar={userDetails?.avatar}
            />
            <EnterPinLabel />
            <PINKeypad
              ref={(elem: any) => (this.pinKeyRef = elem)}
              onComplete={this.onPinProvided}
              pin={this.state.pin}
              key={this.state.resetKey}
            />
            <Link id="forgotten_pin" onClick={this.props.onForgetPin}>
              {this.props.intl.formatMessage(buttonMessages.forgottenPIN)}
            </Link>
          </Stack>

          {this.showErrorMessage()}
        </Box>
      </BackgroundWrapper>
    )
  }
}

export const Unlock = connect(
  (store: IStoreState) => ({
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication
  }
)(injectIntl<'intl', IFullProps>(UnlockView))
