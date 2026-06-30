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
import { Toast } from '@opencrvs/components/lib/Toast'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import * as React from 'react'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { useIntl } from 'react-intl'
import { useOnlineStatus } from '@client/utils'
import { EMPTY_STRING } from '@client/utils/constants'
import { errorMessages } from '@client/i18n/messages/errors'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useCurrentUser } from '@client/v2-events/hooks/useCurrentUser'

interface IProps {
  show: boolean
  onSuccess: (phoneNumber: string, nonce: string) => void
  onClose: () => void
}

const isAValidPhoneNumberFormat = (value: string): boolean => {
  const pattern = window.config.PHONE_NUMBER_PATTERN

  return new RegExp(pattern).test(value)
}

export function ChangeNumberView({ show, onSuccess, onClose }: IProps) {
  const intl = useIntl()
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)
  const [unknownError, setUnknownError] = React.useState(false)
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = React.useState(false)
  const { currentUser } = useCurrentUser()
  const isOnline = useOnlineStatus()
  const [
    showDuplicateMobileErrorNotification,
    setShowDuplicateMobileErrorNotification
  ] = React.useState(false)
  const { requestPhoneChange } = useUsers()
  const isMobileNumberUnchanged =
    Boolean(phoneNumber) && phoneNumber === currentUser?.mobile
  const onChangePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = event.target.value
    setPhoneNumber(phoneNumber)
    setIsInvalidPhoneNumber(!isAValidPhoneNumberFormat(phoneNumber))
    if (showDuplicateMobileErrorNotification) {
      setShowDuplicateMobileErrorNotification(false)
    }
  }

  const restoreState = () => {
    setPhoneNumber(EMPTY_STRING)
    setIsInvalidPhoneNumber(false)
    setUnknownError(false)
    setShowDuplicateMobileErrorNotification(false)
  }
  const toggleDuplicateMobileErrorNotification = () => {
    setShowDuplicateMobileErrorNotification((prevValue) => !prevValue)
  }
  const toggleUnknownErrorNotification = () => {
    setUnknownError((prevValue) => !prevValue)
  }
  const continueButtonHandler = async (phoneNumber: string) => {
    if (!currentUser) return
    requestPhoneChange.mutate(
      { phoneNumber },
      {
        onSuccess: (data) => {
          onSuccess(phoneNumber, data.nonce)
        },
        onError: (error) => {
          if (error.data?.code === 'CONFLICT') {
            setShowDuplicateMobileErrorNotification(true)
          } else {
            setUnknownError(true)
          }
        }
      }
    )
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <Dialog
      id="ChangePhoneNumberModal"
      isOpen={show}
      title={intl.formatMessage(messages.changePhoneLabel)}
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <PrimaryButton
          id="continue-button"
          key="continue"
          onClick={() => {
            continueButtonHandler(phoneNumber)
          }}
          disabled={
            !isOnline ||
            requestPhoneChange.isPending ||
            !Boolean(phoneNumber.length) ||
            isInvalidPhoneNumber ||
            isMobileNumberUnchanged
          }
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      onClose={onClose}
    >
      <InputField
        id="phoneNumber"
        touched={true}
        required={false}
        optionalLabel=""
        error={
          isInvalidPhoneNumber
            ? intl.formatMessage(messages.phoneNumberChangeFormValidationMsg, {
                num: intl.formatMessage({
                  defaultMessage: '10',
                  id: 'phone.digit'
                }),
                start: intl.formatMessage({
                  defaultMessage: '0(4|5)',
                  description: 'Should starts with',
                  id: 'phone.start'
                })
              })
            : isMobileNumberUnchanged
              ? intl.formatMessage(messages.mobileNumberUnchangedErrorMessege)
              : ''
        }
      >
        <TextInput
          id="PhoneNumber"
          type="number"
          touched={true}
          error={isInvalidPhoneNumber}
          value={phoneNumber}
          onChange={onChangePhoneNumber}
        />
      </InputField>
      {showDuplicateMobileErrorNotification && (
        <Toast
          id="duplicate-mobile-error-notification"
          type="warning"
          onClose={() => toggleDuplicateMobileErrorNotification()}
        >
          {intl.formatMessage(messages.duplicateUserMobileErrorMessege, {
            number: phoneNumber
          })}
        </Toast>
      )}
      {unknownError && (
        <Toast
          id="unknown-error-notification"
          type="warning"
          onClose={() => toggleUnknownErrorNotification()}
        >
          {intl.formatMessage(errorMessages.unknownErrorTitle)}
        </Toast>
      )}
    </Dialog>
  )
}
