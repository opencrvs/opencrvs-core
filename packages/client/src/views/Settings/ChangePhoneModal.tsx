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
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { getUserDetails, getUserNonce } from '@client/profile/profileSelectors'
import styled from '@client/styledComponents'
import {
  ErrorMessage,
  InputField,
  TextInput
} from '@opencrvs/components/lib/forms'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import {
  sendVerifyCode,
  modifyUserDetails
} from '@client/profile/profileActions'
import { EMPTY_STRING } from '@client/utils/constants'
import { isAValidPhoneNumberFormat } from '@client/utils/validate'
import { Mutation } from 'react-apollo'
import { get, isNull } from 'lodash'
import { userMessages } from '@client/i18n/messages/user'
import { convertToMSISDN } from '@client/forms/utils'
import { queriesForUser } from '@client/views/Settings/queries'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { changePhoneMutation } from '@client/views/Settings/mutations'

const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`

const InvalidPhoneNumber = styled.div`
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  color: ${({ theme }) => theme.colors.negative};
  margin-top: 8px;
`
const BoxedError = styled.div`
  margin-top: -10px;
  ${({ theme }) => theme.fonts.reg16};
  margin-bottom: 10px;
  display: flex;
`

const VIEW_TYPE = {
  CHANGE_NUMBER: 'change',
  VERIFY_NUMBER: 'verify'
}

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
}

export function ChangePhoneModal({ show, onClose, onSuccess }: IProps) {
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)
  const [verifyCode, setVerifyCode] = React.useState(EMPTY_STRING)
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = React.useState(false)
  const [isInvalidLength, setIsInvalidLength] = React.useState(false)
  const [_, setPhoneNumberFormatText] = React.useState(EMPTY_STRING)
  const [view, setView] = React.useState(VIEW_TYPE.CHANGE_NUMBER)
  const [errorOccured, setErrorOccured] = React.useState(false)
  const [
    showDuplicateMobileErrorNotification,
    setShowDuplicateMobileErrorNotification
  ] = React.useState(false)
  const dispatch = useDispatch()
  const userDetails = useSelector(getUserDetails)
  const nonce = useSelector(getUserNonce)
  const intl = useIntl()

  const toggleDuplicateMobileErrorNotification = () => {
    setShowDuplicateMobileErrorNotification((prevValue) => !prevValue)
  }

  const onChangePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = event.target.value
    setPhoneNumber(phoneNumber)
    setIsInvalidPhoneNumber(!isAValidPhoneNumberFormat(phoneNumber))
  }
  const onChangeVerifyCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const verifyCode = event.target.value
    setVerifyCode(verifyCode)
    setIsInvalidLength(verifyCode.length === 6)
  }

  const continueButtonHandler = async (phoneNumber: string) => {
    const userData = await queriesForUser.fetchUserDetails(
      convertToMSISDN(phoneNumber)
    )
    const userDetails = userData.data.getUserByMobile
    if (VIEW_TYPE.CHANGE_NUMBER && isNull(userDetails.id)) {
      dispatch(sendVerifyCode(convertToMSISDN(phoneNumber)))
      setView(VIEW_TYPE.VERIFY_NUMBER)
    } else {
      toggleDuplicateMobileErrorNotification()
    }
  }

  const callChangePhoneMutation = (mutation: () => void) => {
    if (!!phoneNumber && !isInvalidPhoneNumber && isInvalidLength) {
      mutation()
    }
  }

  const restoreState = () => {
    setPhoneNumber(EMPTY_STRING)
    setVerifyCode(EMPTY_STRING)
    setPhoneNumberFormatText(EMPTY_STRING)
    setIsInvalidLength(false)
    setIsInvalidPhoneNumber(false)
    setErrorOccured(false)
    setView(VIEW_TYPE.CHANGE_NUMBER)
  }

  const phoneChangeCompleted = () => {
    restoreState()
    if (userDetails) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          mobile: convertToMSISDN(phoneNumber)
        })
      )
    }
    onSuccess()
  }

  const handleClose = () => {
    restoreState()
    onClose()
  }

  return (
    <ResponsiveModal
      id="ChangePhoneNumberModal"
      show={show}
      title={
        view === VIEW_TYPE.CHANGE_NUMBER
          ? intl.formatMessage(messages.changePhoneLabel)
          : intl.formatMessage(messages.verifyPhoneLabel)
      }
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={handleClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        view === VIEW_TYPE.CHANGE_NUMBER ? (
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
        ) : (
          <Mutation
            mutation={changePhoneMutation}
            variables={{
              userId: get(userDetails, 'userMgntUserID'),
              phoneNumber: convertToMSISDN(phoneNumber),
              nonce: nonce,
              verifyCode: verifyCode
            }}
            onCompleted={phoneChangeCompleted}
            onError={() => setErrorOccured(true)}
          >
            {(changePhone: any) => {
              return (
                <PrimaryButton
                  id="verify-button"
                  key="verify"
                  onClick={() => {
                    callChangePhoneMutation(changePhone)
                  }}
                  disabled={!Boolean(verifyCode.length) || !isInvalidLength}
                >
                  {intl.formatMessage(buttonMessages.verify)}
                </PrimaryButton>
              )
            }}
          </Mutation>
        )
      ]}
      handleClose={handleClose}
      contentHeight={150}
      contentScrollableY={true}
    >
      {view === VIEW_TYPE.CHANGE_NUMBER && (
        <>
          <InputField
            id="phoneNumber"
            touched={true}
            required={false}
            optionalLabel=""
            error={
              isInvalidPhoneNumber
                ? intl.formatMessage(
                    messages.phoneNumberChangeFormValidationMsg,
                    {
                      num: intl.formatMessage({
                        defaultMessage: '10',
                        id: 'phone.digit'
                      }),
                      start: intl.formatMessage({
                        defaultMessage: '0(4|5)',
                        description: 'Should starts with',
                        id: 'phone.start'
                      })
                    }
                  )
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
        </>
      )}
      {view === VIEW_TYPE.VERIFY_NUMBER && (
        <>
          <InputField
            id="verifyCode"
            touched={true}
            required={false}
            optionalLabel=""
            error={
              errorOccured
                ? intl.formatMessage(messages.incorrectVerifyCode)
                : ''
            }
          >
            <TextInput
              id="VerifyCode"
              type="number"
              touched={true}
              error={errorOccured}
              value={verifyCode}
              onChange={onChangeVerifyCode}
            />
          </InputField>
        </>
      )}
      <FloatingNotification
        id="duplicate-mobile-error-notification"
        type={NOTIFICATION_TYPE.ERROR}
        show={showDuplicateMobileErrorNotification}
        callback={() => toggleDuplicateMobileErrorNotification()}
      >
        {intl.formatMessage(userMessages.duplicateUserMobileErrorMessege, {
          number: phoneNumber
        })}
      </FloatingNotification>
    </ResponsiveModal>
  )
}
