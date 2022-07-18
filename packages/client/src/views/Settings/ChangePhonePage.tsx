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
import { connect, useDispatch, useSelector } from 'react-redux'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  useIntl
} from 'react-intl'
import { IStoreState } from '@client/store'
import { getUserDetails, getUserNonce } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import styled from '@client/styledComponents'
import {
  ErrorMessage,
  InputField,
  TextInput
} from '@opencrvs/components/lib/forms'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import {
  sendVerifyCode,
  modifyUserDetails
} from '@client/profile/profileActions'
import {
  goToSettingsWithPhoneSuccessMsg,
  goBack as goBackAction
} from '@client/navigation'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { EMPTY_STRING } from '@client/utils/constants'
import { isAValidPhoneNumberFormat } from '@client/utils/validate'
import { Mutation } from 'react-apollo'
import { get, isNull } from 'lodash'
import { userMessages } from '@client/i18n/messages/user'
import { convertToMSISDN } from '@client/forms/utils'
import { queriesForUser } from '@client/views/Settings/queries'
import {
  FloatingNotification,
  NOTIFICATION_TYPE
} from '@opencrvs/components/lib/interface'
import { changePhoneMutation } from '@client/views/Settings/mutations'

const Container = styled.div`
  ${({ theme }) => theme.shadows.light};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  padding: 40px 77px;
  margin: 36px auto;
  width: 1140px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0;
    padding: 24px 0;
    width: 100%;
    min-height: 100vh;
    margin-top: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
`
const StyledPrimaryButton = styled(PrimaryButton)`
  display: absolute;
  width: 115px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin-top: 24px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-top: 24px;
  }
`
const HalfWidthInput = styled(TextInput)`
  width: 271px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const FormSectionTitle = styled.h4`
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 0px;
  margin-bottom: 16px;
`

const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`

const Field = styled.div`
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`
const Message = styled.div`
  margin-bottom: 16px;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
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

interface IState {
  phoneNumber: string
  verifyCode: string
  isInvalidPhoneNumber: boolean
  isInvalidLength: boolean
  phoneNumberFormatText: string
  view: string
  errorOccured: boolean
  showDuplicateMobileErrorNotification: boolean
}

export function ChangePhonePage() {
  const [phoneNumber, setPhoneNumber] = React.useState(EMPTY_STRING)
  const [verifyCode, setVerifyCode] = React.useState(EMPTY_STRING)
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = React.useState(false)
  const [isInvalidLength, setIsInvalidLength] = React.useState(false)
  const [phoneNumberFormatText, setPhoneNumberFormatText] =
    React.useState(EMPTY_STRING)
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
    if (!phoneNumber) return
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

  const phoneChangeCompleted = () => {
    setPhoneNumber(EMPTY_STRING)
    setVerifyCode(EMPTY_STRING)
    setPhoneNumberFormatText(EMPTY_STRING)
    setErrorOccured(false)
    if (userDetails) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          mobile: convertToMSISDN(phoneNumber)
        })
      )
    }
    dispatch(goToSettingsWithPhoneSuccessMsg(true))
  }

  return (
    <>
      <SysAdminContentWrapper
        id="user-phone-change"
        type={SysAdminPageVariant.SUBPAGE_CENTERED}
        backActionHandler={() => window.history.back()}
        headerTitle={
          view === VIEW_TYPE.CHANGE_NUMBER
            ? intl.formatMessage(messages.changePhoneTitle)
            : intl.formatMessage(messages.verifyPhoneTitle)
        }
      >
        {view === VIEW_TYPE.CHANGE_NUMBER && (
          <Container>
            <Content>
              <FormSectionTitle>
                <>{intl.formatMessage(messages.changePhoneLabel)}</>
              </FormSectionTitle>
            </Content>
            <Content>
              <Field>
                <InputField
                  id="phoneNumber"
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <HalfWidthInput
                    id="PhoneNumber"
                    type="number"
                    touched={true}
                    error={isInvalidPhoneNumber}
                    value={phoneNumber}
                    onChange={onChangePhoneNumber}
                  />
                </InputField>
                {isInvalidPhoneNumber && (
                  <InvalidPhoneNumber id="invalidPhoneNumber">
                    {intl.formatMessage(
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
                    )}
                  </InvalidPhoneNumber>
                )}
              </Field>
            </Content>
            <Content>
              <StyledPrimaryButton
                id="continue-button"
                key="continue"
                onClick={() => {
                  continueButtonHandler(phoneNumber)
                }}
                disabled={!Boolean(phoneNumber.length) || isInvalidPhoneNumber}
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </StyledPrimaryButton>
            </Content>
          </Container>
        )}
        {view === VIEW_TYPE.VERIFY_NUMBER && (
          <Container>
            <Content>
              <FormSectionTitle>
                <>{intl.formatMessage(messages.verifyPhoneLabel)}</>
              </FormSectionTitle>
            </Content>
            <Content>
              <Message>
                {intl.formatMessage(messages.confirmationPhoneMsg, {
                  num: intl.formatMessage({
                    defaultMessage: phoneNumber,
                    description: 'Phone confirmation number',
                    id: 'phone.number'
                  })
                })}
              </Message>
            </Content>
            {errorOccured && (
              <Content>
                <BoxedError>
                  <ErrorMessage>
                    {intl.formatMessage(messages.incorrectVerifyCode)}
                  </ErrorMessage>
                </BoxedError>
              </Content>
            )}
            <Content>
              <Field>
                <InputField
                  id="verifyCode"
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <HalfWidthInput
                    id="VerifyCode"
                    type="number"
                    touched={true}
                    error={isInvalidPhoneNumber}
                    value={verifyCode}
                    onChange={onChangeVerifyCode}
                  />
                </InputField>
              </Field>
            </Content>
            <Content>
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
                    <StyledPrimaryButton
                      id="verify-button"
                      key="verify"
                      onClick={() => {
                        callChangePhoneMutation(changePhone)
                      }}
                      disabled={!Boolean(verifyCode.length) || !isInvalidLength}
                    >
                      {intl.formatMessage(buttonMessages.verify)}
                    </StyledPrimaryButton>
                  )
                }}
              </Mutation>
            </Content>
          </Container>
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
      </SysAdminContentWrapper>
    </>
  )
}
