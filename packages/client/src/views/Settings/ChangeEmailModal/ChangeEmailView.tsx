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
import * as React from 'react'
import {
  Toast,
  Dialog,
  Button,
  InputField,
  TextInput
} from '@opencrvs/components'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { EMPTY_STRING } from '@client/utils/constants'
import { useSelector } from 'react-redux'
import { useOnlineStatus } from '@client/utils'
import { isAValidEmailAddressFormat } from '@client/utils/validate'
import { getUserDetails } from '@client/profile/profileSelectors'
import { errorMessages } from '@client/i18n/messages/errors'
import { useUsers } from '@client/v2-events/hooks/useUsers'

interface IProps {
  show: boolean
  onSuccess: (emailAddress: string, nonce: string) => void
  onClose: () => void
}

export function ChangeEmailView({ show, onSuccess, onClose }: IProps) {
  const intl = useIntl()
  const [emailAddress, setEmailAddress] = React.useState(EMPTY_STRING)
  const [unknownError, setUnknownError] = React.useState(false)
  const [isInvalidEmailAddress, setIsInvalidEmailAddress] =
    React.useState(false)
  const [
    showDuplicateEmailErrorNotification,
    setShowDuplicateEmailErrorNotification
  ] = React.useState(false)
  const userDetails = useSelector(getUserDetails)
  const isOnline = useOnlineStatus()
  const { requestEmailChange } = useUsers()
  const isEmailAddressUnchanged =
    Boolean(emailAddress) &&
    emailAddress.trim().toLowerCase() === userDetails?.email?.toLowerCase()

  const onChangeEmailAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const emailAddress = event.target.value
    setEmailAddress(emailAddress)
    setIsInvalidEmailAddress(!isAValidEmailAddressFormat(emailAddress))
    if (showDuplicateEmailErrorNotification) {
      setShowDuplicateEmailErrorNotification(false)
    }
  }
  const restoreState = () => {
    setEmailAddress(EMPTY_STRING)
    setIsInvalidEmailAddress(false)
    setUnknownError(false)
    setShowDuplicateEmailErrorNotification(false)
  }
  const toggleDuplicateEmailErrorNotification = () => {
    setShowDuplicateEmailErrorNotification((prevValue) => !prevValue)
  }
  const toggleUnknownErrorNotification = () => {
    setUnknownError((prevValue) => !prevValue)
  }
  const continueButtonHandler = async (emailAddress: string) => {
    if (!userDetails) return
    requestEmailChange.mutate(
      { email: emailAddress },
      {
        onSuccess: (data) => {
          onSuccess(emailAddress, data.nonce)
        },
        onError: (error) => {
          if (error.data?.code === 'CONFLICT') {
            setShowDuplicateEmailErrorNotification(true)
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
      id="ChangeEmailAddressModal"
      isOpen={show}
      title={intl.formatMessage(messages.changeEmailLabel)}
      actions={[
        <Button
          size="large"
          type="tertiary"
          key="cancel"
          id="modal_cancel"
          onClick={onClose}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          size="large"
          type="primary"
          id="continue-button"
          key="continue"
          onClick={() => {
            continueButtonHandler(emailAddress)
          }}
          disabled={
            !isOnline ||
            requestEmailChange.isPending ||
            !Boolean(emailAddress.length) ||
            isInvalidEmailAddress ||
            isEmailAddressUnchanged
          }
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </Button>
      ]}
      onClose={onClose}
    >
      <InputField
        id="emailAddress"
        touched={true}
        required={false}
        optionalLabel=""
        error={
          isInvalidEmailAddress
            ? intl.formatMessage(messages.emailAddressChangeFormValidationMsg)
            : isEmailAddressUnchanged
              ? intl.formatMessage(messages.emailAddressUnchangedErrorMessege)
              : ''
        }
      >
        <TextInput
          id="EmailAddressTextInput"
          touched={true}
          error={isInvalidEmailAddress}
          value={emailAddress}
          onChange={onChangeEmailAddress}
        />
      </InputField>
      {showDuplicateEmailErrorNotification && (
        <Toast
          id="duplicate-email-error-notification"
          type="warning"
          onClose={() => toggleDuplicateEmailErrorNotification()}
        >
          {intl.formatMessage(messages.duplicateUserEmailErrorMessege, {
            email: emailAddress
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
