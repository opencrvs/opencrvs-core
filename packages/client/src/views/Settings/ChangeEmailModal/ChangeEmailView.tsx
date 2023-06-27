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
import { Toast } from '@opencrvs/components/lib/Toast'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import * as React from 'react'
import { Button } from '@opencrvs/components/lib/Button'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { useIntl } from 'react-intl'
import { EMPTY_STRING } from '@client/utils/constants'
import { queriesForUser } from '@client/views/Settings/queries'
import { useDispatch, useSelector } from 'react-redux'
import { sendVerifyCode } from '@client/profile/profileActions'
import { isAValidEmailAddressFormat } from '@client/utils/validate'
import { NotificationEvent } from '@client/profile/serviceApi'
import { getLanguage } from '@client/i18n/selectors'
import { convertToMSISDN } from '@client/forms/utils'
import { getUserDetails } from '@client/profile/profileSelectors'

interface IProps {
  show: boolean
  onSuccess: (emailAddress: string) => void
  onClose: () => void
}

export function ChangeEmailView({ show, onSuccess, onClose }: IProps) {
  const intl = useIntl()
  const [emailAddress, setEmailAddress] = React.useState(EMPTY_STRING)
  const [isInvalidEmailAddress, setIsInvalidEmailAddress] =
    React.useState(false)
  const [
    showDuplicateEmailErrorNotification,
    setShowDuplicateEmailErrorNotification
  ] = React.useState(false)
  const dispatch = useDispatch()
  const userDetails = useSelector(getUserDetails)
  const language = useSelector(getLanguage)

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
  }
  const toggleDuplicateEmailErrorNotification = () => {
    setShowDuplicateEmailErrorNotification((prevValue) => !prevValue)
  }
  const continueButtonHandler = async (emailAddress: string) => {
    const userData = await queriesForUser.fetchUserDetailsByEmail(emailAddress)
    const emailExists = userData.data.getUserByEmail

    if (!emailExists) {
      const notificationEvent = NotificationEvent.CHANGE_EMAIL_ADDRESS
      dispatch(
        sendVerifyCode(
          [
            {
              use: language,
              family: String(userDetails?.name?.[0].familyName),
              given: [String(userDetails?.name?.[0].firstNames)]
            }
          ],
          notificationEvent,
          userDetails?.mobile
            ? convertToMSISDN(userDetails?.mobile, window.config.COUNTRY)
            : undefined,
          emailAddress
        )
      )
      onSuccess(emailAddress)
    } else {
      toggleDuplicateEmailErrorNotification()
    }
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <Dialog
      id="ChangeEmailAddressModal"
      title={intl.formatMessage(messages.changeEmailLabel)}
      onOpen={show}
      actions={[
        <Button
          key="cancel"
          id="modal_cancel"
          type="tertiary"
          onClick={onClose}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          id="continue-button"
          key="continue"
          type="primary"
          onClick={() => {
            continueButtonHandler(emailAddress)
          }}
          disabled={!Boolean(emailAddress.length) || isInvalidEmailAddress}
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
    </Dialog>
  )
}
