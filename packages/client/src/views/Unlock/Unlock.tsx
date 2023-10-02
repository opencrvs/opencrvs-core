/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import styled from 'styled-components'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { messages } from '@client/i18n/messages/views/pin'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { storage } from '@client/storage'
import { IStoreState } from '@client/store'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { getUserName, UserDetails } from '@client/utils/userUtils'
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
import { Box, Stack, Text, Toast } from '@opencrvs/components'
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
  userDetails: UserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
}
type IFullProps = Props &
  IntlShapeProps & {
    onCorrectPinMatch: () => void
    onForgetPin: () => void
  }

const LogoutButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
`

const Content = styled(Stack)`
  padding: 16px 0;
`

const MAX_LOCK_TIME = 1
const MAX_ALLOWED_ATTEMPT = 3

const EnterPinLabel = () => {
  const intl = useIntl()
  return (
    <Text element="h1" variant="h2" align="center">
      {intl.formatMessage(userMessages.enterPinLabel)}
    </Text>
  )
}

class UnlockView extends React.Component<IFullProps, IFullState> {
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

  render() {
    const { userDetails } = this.props
    return (
      <BackgroundWrapper id="unlockPage">
        <Box id="Box">
          <LogoutButton type="icon" onClick={this.logout} id="logout">
            <Icon name="SignOut" />
          </LogoutButton>

          <Content direction="column" gap={0} justifyContent="flex-start">
            <AvatarLarge
              name={getUserName(userDetails)}
              avatar={userDetails?.avatar}
            />
            <EnterPinLabel />
            <Stack direction="column" gap={16} justifyContent="flex-start">
              <PINKeypad
                onComplete={this.onPinProvided}
                pin={this.state.pin}
                key={this.state.resetKey}
              />

              <Button
                size="small"
                type="tertiary"
                id="forgotten_pin"
                onClick={this.props.onForgetPin}
              >
                {this.props.intl.formatMessage(buttonMessages.forgottenPIN)}
              </Button>
            </Stack>
          </Content>

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
