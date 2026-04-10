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
import { convertToMSISDN } from '@client/forms/utils'
import { buttonMessages, userMessages as messages } from '@client/i18n/messages'
import { modifyUserDetails } from '@client/profile/profileActions'
import { getUserDetails } from '@client/profile/profileSelectors'
import { EMPTY_STRING } from '@client/utils/constants'
import { Message } from '@client/views/Settings/items/components'
import { InputField } from '@opencrvs/components/lib/InputField'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { TRPCClientError } from '@trpc/client'
import { AppRouter } from '@client/v2-events/trpc'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
  nonce: string
  data: {
    phoneNumber?: string
    email?: string
  }
}

function isConflict(error: TRPCClientError<AppRouter> | null): boolean {
  return error?.data?.code === 'CONFLICT'
}

export function VerifyCodeView({
  show,
  onSuccess,
  onClose,
  nonce,
  data
}: IProps) {
  const intl = useIntl()
  const { phoneNumber, email } = data
  const userDetails = useSelector(getUserDetails)

  const [verifyCode, setVerifyCode] = React.useState(EMPTY_STRING)
  const [isValidLength, setIsValidLength] = React.useState(false)
  const [errorOccured, setErrorOccured] =
    React.useState<TRPCClientError<AppRouter> | null>(null)
  const dispatch = useDispatch()
  const { changePhone, changeEmail } = useUsers()

  const onChangeVerifyCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setVerifyCode(value)
    setIsValidLength(value.length === 6)
    setErrorOccured(null)
  }
  const restoreState = () => {
    setVerifyCode(EMPTY_STRING)
    setIsValidLength(false)
    setErrorOccured(null)
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

  const submitVerification = () => {
    if (!userDetails || !nonce || verifyCode.length !== 6) return

    if (phoneNumber) {
      changePhone.mutate(
        {
          userId: userDetails.id,
          phoneNumber,
          nonce,
          verifyCode
        },
        {
          onSuccess: () => phoneChangeCompleted(),
          onError: (err) => {
            setErrorOccured(err as TRPCClientError<AppRouter>)
          }
        }
      )
    } else if (email) {
      changeEmail.mutate(
        {
          userId: userDetails.id,
          email,
          nonce,
          verifyCode
        },
        {
          onSuccess: () => emailChangeCompleted(),
          onError: (err) => setErrorOccured(err as TRPCClientError<AppRouter>)
        }
      )
    }
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
        <PrimaryButton
          key="verify"
          id="verify-button"
          onClick={submitVerification}
          disabled={!isValidLength}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
    >
      <Message>
        {data.phoneNumber
          ? intl.formatMessage(messages.confirmationPhoneMsg, {
              email: userDetails?.email
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
          isConflict(errorOccured)
            ? data.phoneNumber
              ? intl.formatMessage(messages.duplicateUserMobileErrorMessege, {
                  number: phoneNumber
                })
              : intl.formatMessage(messages.duplicateUserEmailErrorMessege, {
                  email: email
                })
            : errorOccured
              ? intl.formatMessage(messages.incorrectVerifyCode)
              : ''
        }
      >
        <TextInput
          id="VerifyCode"
          type="number"
          touched={true}
          error={!!errorOccured}
          value={verifyCode}
          onChange={onChangeVerifyCode}
        />
      </InputField>
    </ResponsiveModal>
  )
}
