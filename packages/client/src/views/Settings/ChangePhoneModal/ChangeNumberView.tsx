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
import { isAValidPhoneNumberFormat } from '@client/utils/validate'
import { convertToMSISDN } from '@client/forms/utils'
import { queriesForUser } from '@client/views/Settings/queries'
import { useDispatch, useSelector } from 'react-redux'
import { sendVerifyCode } from '@client/profile/profileActions'
import { NotificationEvent } from '@client/profile/serviceApi'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getLanguage } from '@client/i18n/selectors'

interface IProps {
  show: boolean
  onSuccess: (phoneNumber: string) => void
  onClose: () => void
}

export function ChangeNumberView({ show, onSuccess, onClose }: IProps) {
  const intl = useIntl()
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = React.useState(false)
  const userDetails = useSelector(getUserDetails)
  const language = useSelector(getLanguage)
  const [
    showDuplicateMobileErrorNotification,
    setShowDuplicateMobileErrorNotification
  ] = React.useState(false)
  const dispatch = useDispatch()
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
  }
  const toggleDuplicateMobileErrorNotification = () => {
    setShowDuplicateMobileErrorNotification((prevValue) => !prevValue)
  }
  const continueButtonHandler = async (phoneNumber: string) => {
    const userData = await queriesForUser.fetchUserDetailsByMobile(
      convertToMSISDN(phoneNumber, window.config.COUNTRY)
    )
    const mobileNumberExist = userData.data.getUserByMobile

    if (!mobileNumberExist) {
      const notificationEvent = NotificationEvent.CHANGE_PHONE_NUMBER

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
          convertToMSISDN(phoneNumber, window.config.COUNTRY),
          String(userDetails?.email)
        )
      )
      onSuccess(phoneNumber)
    } else {
      toggleDuplicateMobileErrorNotification()
    }
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <ResponsiveModal
      id="ChangePhoneNumberModal"
      show={show}
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
          disabled={!Boolean(phoneNumber.length) || isInvalidPhoneNumber}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
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
    </ResponsiveModal>
  )
}
