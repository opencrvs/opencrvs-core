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
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
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
  sendVerifyCode as SendVerifyCodeAction,
  modifyUserDetails as modifyUserDetailsAction
} from '@client/profile/profileActions'
import {
  goToSettingsWithPhoneSuccessMsg as goToSettingsWithPhoneSuccessMsgAction,
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
import { queriesForUser } from './queries'
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
  font-family: ${({ theme }) => theme.fonts.semiBoldFont};
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.negative};
  margin-top: 8px;
`
const BoxedError = styled.div`
  margin-top: -10px;
  ${({ theme }) => theme.fonts.reg16};
  margin-bottom: 10px;
  display: flex;
`

type IProps = IntlShapeProps & {
  userDetails: IUserDetails | null
  nonce: string | null
  modifyUserDetails: typeof modifyUserDetailsAction
  goBack: typeof goBackAction
  sendVerifyCode: typeof SendVerifyCodeAction
  goToSettingsWithPhoneSuccessMsg: typeof goToSettingsWithPhoneSuccessMsgAction
}

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

interface IDispatchProps {
  sendVerifyCode: typeof SendVerifyCodeAction
}

class ChangePhoneView extends React.Component<IProps & IDispatchProps, IState> {
  constructor(props: IProps & IDispatchProps) {
    super(props)
    this.state = {
      phoneNumber: EMPTY_STRING,
      verifyCode: EMPTY_STRING,
      isInvalidPhoneNumber: false,
      isInvalidLength: false,
      phoneNumberFormatText: EMPTY_STRING,
      view: VIEW_TYPE.CHANGE_NUMBER,
      errorOccured: false,
      showDuplicateMobileErrorNotification: false
    }
  }

  toggleDuplicateMobileErrorNotification = () => {
    this.setState((prevState) => ({
      showDuplicateMobileErrorNotification:
        !prevState.showDuplicateMobileErrorNotification
    }))
  }

  setPhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = event.target.value
    this.setState(() => ({
      phoneNumber,
      isInvalidPhoneNumber: !isAValidPhoneNumberFormat(phoneNumber)
    }))
  }
  setVerifyCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const verifyCode = event.target.value
    this.setState(() => ({
      verifyCode,
      isInvalidLength: verifyCode.length === 6
    }))
  }
  continueButtonHandler = async (phoneNumber: string) => {
    if (!phoneNumber) return
    const userData = await queriesForUser.fetchUserDetails(
      convertToMSISDN(phoneNumber)
    )
    const userDetails = userData.data.getUserByMobile
    if (VIEW_TYPE.CHANGE_NUMBER && isNull(userDetails.id)) {
      this.props.sendVerifyCode(convertToMSISDN(phoneNumber))
      this.setState({
        view: VIEW_TYPE.VERIFY_NUMBER
      })
    } else {
      this.toggleDuplicateMobileErrorNotification()
    }
  }

  changePhone = (mutation: () => void) => {
    if (
      !!this.state.phoneNumber &&
      !this.state.isInvalidPhoneNumber &&
      this.state.isInvalidLength
    ) {
      mutation()
    }
  }

  phoneChangeCompleted = () => {
    this.setState({
      phoneNumber: EMPTY_STRING,
      verifyCode: EMPTY_STRING,
      phoneNumberFormatText: EMPTY_STRING,
      errorOccured: false
    })
    if (this.props.userDetails) {
      const { userDetails } = this.props
      this.props.modifyUserDetails({
        ...userDetails,
        mobile: convertToMSISDN(this.state.phoneNumber)
      })
    }
    this.props.goToSettingsWithPhoneSuccessMsg(true)
  }

  render() {
    const { intl, nonce } = this.props
    return (
      <>
        <SysAdminContentWrapper
          id="user-phone-change"
          type={SysAdminPageVariant.SUBPAGE_CENTERED}
          backActionHandler={() => window.history.back()}
          headerTitle={
            this.state.view === VIEW_TYPE.CHANGE_NUMBER
              ? intl.formatMessage(messages.changePhoneTitle)
              : intl.formatMessage(messages.verifyPhoneTitle)
          }
        >
          {this.state.view === VIEW_TYPE.CHANGE_NUMBER && (
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
                      error={this.state.isInvalidPhoneNumber}
                      value={this.state.phoneNumber}
                      onChange={this.setPhoneNumber}
                    />
                  </InputField>
                  {this.state.isInvalidPhoneNumber && (
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
                    this.continueButtonHandler(this.state.phoneNumber)
                  }}
                  disabled={
                    !Boolean(this.state.phoneNumber.length) ||
                    this.state.isInvalidPhoneNumber
                  }
                >
                  {intl.formatMessage(buttonMessages.continueButton)}
                </StyledPrimaryButton>
              </Content>
            </Container>
          )}
          {this.state.view === VIEW_TYPE.VERIFY_NUMBER && (
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
                      defaultMessage: this.state.phoneNumber,
                      description: 'Phone confirmation number',
                      id: 'phone.number'
                    })
                  })}
                </Message>
              </Content>
              {this.state.errorOccured && (
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
                      id="verifyCode"
                      type="text"
                      touched={true}
                      error={this.state.isInvalidPhoneNumber}
                      value={this.state.verifyCode}
                      onChange={this.setVerifyCode}
                    />
                  </InputField>
                </Field>
              </Content>
              <Content>
                <Mutation
                  mutation={changePhoneMutation}
                  variables={{
                    userId: get(this.props, 'userDetails.userMgntUserID'),
                    phoneNumber: convertToMSISDN(this.state.phoneNumber),
                    nonce: nonce,
                    verifyCode: this.state.verifyCode
                  }}
                  onCompleted={this.phoneChangeCompleted}
                  onError={() => this.setState({ errorOccured: true })}
                >
                  {(changePhone: any) => {
                    return (
                      <StyledPrimaryButton
                        id="verify-button"
                        key="verify"
                        onClick={() => {
                          this.changePhone(changePhone)
                        }}
                        disabled={
                          !Boolean(this.state.verifyCode.length) ||
                          !this.state.isInvalidLength
                        }
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
            show={this.state.showDuplicateMobileErrorNotification}
            callback={() => this.toggleDuplicateMobileErrorNotification()}
          >
            {intl.formatMessage(userMessages.duplicateUserMobileErrorMessege, {
              number: this.state.phoneNumber
            })}
          </FloatingNotification>
        </SysAdminContentWrapper>
      </>
    )
  }
}

export const ChangePhonePage = connect(
  (store: IStoreState) => ({
    userDetails: getUserDetails(store),
    nonce: getUserNonce(store)
  }),
  {
    modifyUserDetails: modifyUserDetailsAction,
    goBack: goBackAction,
    sendVerifyCode: SendVerifyCodeAction,
    goToSettingsWithPhoneSuccessMsg: goToSettingsWithPhoneSuccessMsgAction
  }
)(injectIntl(ChangePhoneView))
