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
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  FormattedMessage
} from 'react-intl'
import { IStoreState } from '@client/store'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import styled from '@client/styledComponents'
import { Header } from '@client/components/interface/Header/Header'
import {
  EventTopBar,
  ResponsiveModal,
  NOTIFICATION_TYPE,
  Notification
} from '@opencrvs/components/lib/interface'
import {
  Select,
  ErrorMessage,
  InputField,
  TextInput
} from '@opencrvs/components/lib/forms'
import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import {
  userMessages as messages,
  buttonMessages,
  constantsMessages
} from '@client/i18n/messages'
import { modifyUserDetails as modifyUserDetailsAction } from '@client/profile/profileActions'
import { getDefaultLanguage, getAvailableLanguages } from '@client/i18n/utils'
import { IntlState } from '@client/i18n/reducer'
import {
  goToSettingsWithPhoneSuccessMsg as goToSettingsWithPhoneSuccessMsgAction,
  goBack as goBackAction
} from '@client/navigation'
import { BackArrow } from '@opencrvs/components/lib/icons'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  isAValidPhoneNumberFormat,
  phoneNumberFormat
} from '@client/utils/validate'

const Container = styled.div`
  ${({ theme }) => theme.shadows.mistyShadow};
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
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 0px;
  margin-bottom: 16px;
`

const SettingsTitle = styled.div`
  ${({ theme }) => theme.fonts.h1Style};
  height: 72px;
  margin-left: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const Left = styled.div`
  margin: 0 16px;
  flex-grow: 1;
`
const Right = styled.div`
  display: flex;
  padding-top: 80px;
  margin-left: 112px;
  & .desktop {
    display: block;
  }
  & .tablet {
    display: none;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding-top: 0;
    margin-left: 24px;
    & .desktop {
      display: none;
    }
    & .tablet {
      display: block;
    }
  }
`
const Row = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 20px;
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
`
const Label = styled.label`
  margin-bottom: 8px;
`
const InvalidPhoneNumber = styled.div`
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.error};
  margin-top: 8px;
`

type IProps = IntlShapeProps & {
  userDetails: IUserDetails | null
  goBack: typeof goBackAction
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
  showSuccessNotification: boolean
}

interface ILanguageOptions {
  [key: string]: string
}

class ChangePhoneView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      phoneNumber: EMPTY_STRING,
      verifyCode: EMPTY_STRING,
      isInvalidPhoneNumber: false,
      isInvalidLength: false,
      phoneNumberFormatText: EMPTY_STRING,
      view: VIEW_TYPE.CHANGE_NUMBER,
      errorOccured: false,
      showSuccessNotification: false
    }
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
  continueButtonHandler = (phoneNumber: string, view: string) => {
    if (!phoneNumber) return
    this.setState({
      view: VIEW_TYPE.VERIFY_NUMBER
    })
  }

  render() {
    const { userDetails, intl, goToSettingsWithPhoneSuccessMsg } = this.props
    const mobile = (userDetails && userDetails.mobile) || ''
    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''
    const { start, num } = window.config.PHONE_NUMBER_PATTERN
    return (
      <>
        <SysAdminContentWrapper
          id="user-phone-change"
          type={SysAdminPageVariant.SUBPAGE_CENTERED}
          backActionHandler={() => window.history.back()}
          headerTitle={
            this.state.view === VIEW_TYPE.CHANGE_NUMBER
              ? intl.formatMessage(messages.changePhoneTitle)
              : intl.formatMessage(messages.VerifyPhoneTitle)
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
                            defaultMessage: num,
                            description: 'Minimum number digit',
                            id: 'phone.digit'
                          }),
                          start: intl.formatMessage({
                            defaultMessage: start,
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
                    this.continueButtonHandler(
                      this.state.phoneNumber,
                      this.state.view
                    )
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
                  <>{intl.formatMessage(messages.VerifyPhoneLabel)}</>
                </FormSectionTitle>
              </Content>
              <Content>
                <Message>
                  {intl.formatMessage(messages.ConfirmationPhoneMsg, {
                    num: intl.formatMessage({
                      defaultMessage: this.state.phoneNumber,
                      description: 'Phone confirmation number',
                      id: 'phone.number'
                    })
                  })}
                </Message>
              </Content>
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
                <StyledPrimaryButton
                  id="verify-button"
                  key="verify"
                  onClick={() => {
                    this.props.goToSettingsWithPhoneSuccessMsg(true)
                  }}
                  disabled={
                    !Boolean(this.state.verifyCode.length) ||
                    !this.state.isInvalidLength
                  }
                >
                  {intl.formatMessage(buttonMessages.verify)}
                </StyledPrimaryButton>
              </Content>
            </Container>
          )}
        </SysAdminContentWrapper>
      </>
    )
  }
}

export const ChangePhonePage = connect(
  (store: IStoreState) => ({
    userDetails: getUserDetails(store)
  }),
  {
    goBack: goBackAction,
    goToSettingsWithPhoneSuccessMsg: goToSettingsWithPhoneSuccessMsgAction
  }
)(injectIntl(ChangePhoneView))
