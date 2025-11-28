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
import React, { useState } from 'react'
import { PINKeypad } from '@opencrvs/components/lib/PINKeypad'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import * as bcrypt from 'bcryptjs'
import { storage } from '@client/storage'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { messages } from '@client/i18n/messages/views/pin'
import { getCurrentUserID, IUserData } from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { Stack, Box, Text, Toast } from '@opencrvs/components'
import { BackgroundWrapper, LogoContainer } from '@client/views/common/Common'
import styled from 'styled-components'

type IProps = IntlShapeProps & {
  onComplete: () => void
  offlineCountryConfiguration: IOfflineData
}

const Content = styled(Stack)`
  padding: 16px 0;
`

const CreatePinComponent = ({
  intl,
  offlineCountryConfiguration,
  onComplete
}: IProps) => {
  const [pin, setPin] = useState<string | null>(null)
  const [pinMatchError, setPinMatchError] = useState(false)
  const [pinHasSameDigits, setPinHasSameDigits] = useState(false)
  const [pinHasSeqDigits, setPinHasSeqDigits] = useState(false)
  const [refresher, setRefresher] = useState(false)

  const firstPINEntry = (pin: string) => {
    setRefresher(!refresher)
    const isSameDigits = sameDigits(pin)
    const seqDigits = sequential(pin)
    if (isSameDigits || seqDigits) {
      setPinHasSameDigits(isSameDigits)
      return setPinHasSeqDigits(seqDigits)
    }
    setPin(pin)
    setPinHasSameDigits(false)
    setPinHasSeqDigits(false)
  }

  const secondPINEntry = (newPin: string) => {
    if (newPin !== pin) {
      setPin(null)
      return setPinMatchError(true)
    }
    storePINForUser(pin)
  }

  const sameDigits = (pin: string) => Number(pin) % 1111 === 0

  const sequential = (pin: string) => {
    const d = pin.split('').map((i) => Number(i))
    return d[0] + 1 === d[1] && d[1] + 1 === d[2] && d[2] + 1 === d[3]
  }

  const storePINForUser = async (pin: string) => {
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
    onComplete()
  }

  return (
    <BackgroundWrapper>
      <Box id="Box">
        <Content direction="column" gap={16} justifyContent="flex-start">
          <LogoContainer>
            <CountryLogo
              size="small"
              src={offlineCountryConfiguration.config.COUNTRY_LOGO.file}
            />
          </LogoContainer>
          {pin === null && !pinHasSeqDigits && !pinHasSameDigits && (
            <>
              <Text element="h1" variant="h2" align="center" id="title-text">
                {intl.formatMessage(messages.createTitle)}
              </Text>
              <Text element="p" variant="reg16" align="center">
                {intl.formatMessage(messages.createDescription)}
              </Text>
              {pinMatchError && (
                <Toast
                  type="error"
                  id="pinMatchErrorMsg"
                  onClose={() => setPinMatchError(false)}
                >
                  {intl.formatMessage(messages.pinMatchError)}
                </Toast>
              )}
              <PINKeypad pin="" onComplete={firstPINEntry} />
            </>
          )}
          {pinHasSeqDigits && (
            <>
              <Text element="h1" variant="h2" align="center" id="title-text">
                {intl.formatMessage(messages.createTitle)}
              </Text>
              <Text
                element="p"
                variant="reg16"
                color="supportingCopy"
                align="center"
                id="description-text"
              >
                {intl.formatMessage(messages.createDescription)}
              </Text>
              <Toast
                type="error"
                id="pinHasSeqDigitsErrorMsg"
                onClose={() => {
                  setPinHasSeqDigits(false)
                }}
              >
                {intl.formatMessage(messages.pinSequentialDigitsError)}
              </Toast>
              <PINKeypad
                onComplete={firstPINEntry}
                key={refresher.toString()}
              />
            </>
          )}
          {pinHasSameDigits && (
            <>
              <Text element="h1" variant="h2" align="center" id="title-text">
                {intl.formatMessage(messages.createTitle)}
              </Text>
              <Text
                element="p"
                variant="reg16"
                align="center"
                id="description-text"
              >
                {intl.formatMessage(messages.createDescription)}
              </Text>
              <Toast
                type="error"
                id="pinHasSameDigitsErrorMsg"
                onClose={() => {
                  setPinHasSameDigits(false)
                }}
              >
                {intl.formatMessage(messages.pinSameDigitsError)}
              </Toast>
              <PINKeypad
                onComplete={firstPINEntry}
                key={refresher.toString()}
              />
            </>
          )}
          {pin && (
            <>
              <Text element="h1" variant="h2" align="center" id="title-text">
                {intl.formatMessage(messages.reEnterTitle)}
              </Text>
              <Text
                element="p"
                variant="reg16"
                align="center"
                id="description-text"
              >
                {intl.formatMessage(messages.reEnterDescription)}
              </Text>

              <PINKeypad onComplete={secondPINEntry} />
            </>
          )}
        </Content>
      </Box>
    </BackgroundWrapper>
  )
}

export const CreatePin = connect((store: IStoreState) => ({
  offlineCountryConfiguration: getOfflineData(store)
}))(injectIntl(CreatePinComponent))
