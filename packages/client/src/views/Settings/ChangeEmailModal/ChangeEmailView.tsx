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
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import * as React from 'react'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
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
    <ResponsiveModal
      id="ChangeEmailAddressModal"
      show={show}
      title={intl.formatMessage(messages.changeEmailLabel)}
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <PrimaryButton
          id="continue-button"
          key="continue"
          onClick={() => {
            continueButtonHandler(emailAddress)
          }}
          disabled={!Boolean(emailAddress.length) || isInvalidEmailAddress}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
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
    </ResponsiveModal>
  )
}
