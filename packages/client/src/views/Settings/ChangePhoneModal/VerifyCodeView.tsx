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
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Mutation } from '@apollo/client/react/components'
import {
  changeEmailMutation,
  changePhoneMutation
} from '@client/views/Settings/mutations'
import { convertToMSISDN } from '@client/forms/utils'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { useSelector, useDispatch } from 'react-redux'
import { getUserNonce, getUserDetails } from '@client/profile/profileSelectors'
import { EMPTY_STRING } from '@client/utils/constants'
import { modifyUserDetails } from '@client/profile/profileActions'
import { Message } from '@client/views/Settings/items/components'
import {
  ChangePhoneMutationVariables,
  ChangePasswordMutation,
  ChangeEmailMutationVariables
} from '@client/utils/gateway'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
  data: {
    phoneNumber?: string
    email?: string
  }
}

export function VerifyCodeView({ show, onSuccess, onClose, data }: IProps) {
  const intl = useIntl()
  const { phoneNumber, email } = data
  const userDetails = useSelector(getUserDetails)
  const nonce = useSelector(getUserNonce)
  const [verifyCode, setVerifyCode] = React.useState(EMPTY_STRING)
  const [isInvalidLength, setIsInvalidLength] = React.useState(false)
  const [errorOccured, setErrorOccured] = React.useState(false)
  const dispatch = useDispatch()
  const onChangeVerifyCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const verifyCode = event.target.value
    setVerifyCode(verifyCode)
    setIsInvalidLength(verifyCode.length === 6)
  }
  const restoreState = () => {
    setVerifyCode(EMPTY_STRING)
    setIsInvalidLength(false)
    setErrorOccured(false)
  }
  const phoneChangeCompleted = () => {
    if (userDetails && phoneNumber) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          mobile: convertToMSISDN(phoneNumber, window.config.COUNTRY)
        })
      )
    }
    onSuccess()
  }

  const emailChangeCompleted = () => {
    if (userDetails) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          email: email
        })
      )
    }
    onSuccess()
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <ResponsiveModal
      id="VerifyCodeModal"
      show={show}
      title={intl.formatMessage(messages.verifyPhoneLabel)}
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <Mutation<
          ChangePasswordMutation,
          ChangePhoneMutationVariables | ChangeEmailMutationVariables
        >
          key="change-phone-mutation"
          mutation={phoneNumber ? changePhoneMutation : changeEmailMutation}
          onCompleted={
            phoneNumber ? phoneChangeCompleted : emailChangeCompleted
          }
          onError={() => setErrorOccured(true)}
        >
          {(changePhoneOrEmail) => {
            return (
              <PrimaryButton
                id="verify-button"
                key="verify"
                onClick={() => {
                  if (userDetails?.userMgntUserID) {
                    if (phoneNumber) {
                      changePhoneOrEmail({
                        variables: {
                          userId: userDetails.userMgntUserID,
                          phoneNumber: convertToMSISDN(
                            phoneNumber,
                            window.config.COUNTRY
                          ),
                          nonce: nonce,
                          verifyCode: verifyCode
                        }
                      })
                    } else if (email) {
                      changePhoneOrEmail({
                        variables: {
                          userId: userDetails.userMgntUserID,
                          email: email,
                          nonce: nonce,
                          verifyCode: verifyCode
                        }
                      })
                    }
                  }
                }}
                disabled={!Boolean(verifyCode.length) || !isInvalidLength}
              >
                {intl.formatMessage(buttonMessages.verify)}
              </PrimaryButton>
            )
          }}
        </Mutation>
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
    >
      <Message>
        {window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'sms'
          ? intl.formatMessage(messages.confirmationPhoneMsg, {
              num: phoneNumber || userDetails?.mobile
            })
          : intl.formatMessage(messages.confirmationEmailMsg, {
              email: email || userDetails?.email
            })}
      </Message>
      <InputField
        id="verifyCode"
        touched={true}
        required={false}
        optionalLabel=""
        error={
          errorOccured ? intl.formatMessage(messages.incorrectVerifyCode) : ''
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
    </ResponsiveModal>
  )
}
