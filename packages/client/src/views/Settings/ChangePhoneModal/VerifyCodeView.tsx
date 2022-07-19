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
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Mutation } from 'react-apollo'
import { changePhoneMutation } from '@client/views/Settings/mutations'
import { get } from 'lodash'
import { convertToMSISDN } from '@client/forms/utils'
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { useSelector, useDispatch } from 'react-redux'
import { getUserNonce, getUserDetails } from '@client/profile/profileSelectors'
import { EMPTY_STRING } from '@client/utils/constants'
import { modifyUserDetails } from '@client/profile/profileActions'
import { Message } from '@client/views/Settings/items/components'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
  data: {
    phoneNumber: string
  }
}

export function VerifyCodeView({ show, onSuccess, onClose, data }: IProps) {
  const intl = useIntl()
  const { phoneNumber } = data
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
  const callChangePhoneMutation = (mutation: () => void) => {
    if (!!phoneNumber && isInvalidLength) {
      mutation()
    }
  }
  const restoreState = () => {
    setVerifyCode(EMPTY_STRING)
    setIsInvalidLength(false)
    setErrorOccured(false)
  }
  const phoneChangeCompleted = () => {
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
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
    >
      <Message>
        {intl.formatMessage(messages.confirmationPhoneMsg, {
          num: intl.formatMessage({
            defaultMessage: phoneNumber,
            description: 'Phone confirmation number',
            id: 'phone.number'
          })
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
