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
import { FORGOTTEN_ITEMS } from '@login/login/actions'
import { authApi } from '@login/utils/authApi'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { WarningMessage } from '@opencrvs/components/lib/WarningMessage'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'
import { RouteComponentProps, withRouter } from '@login/common/WithRouterProps'
import * as routes from '@login/navigation/routes'

const GlobalError = styled.div`
  color: ${({ theme }) => theme.colors.negative};
`
const PasswordMatch = styled.div`
  color: ${({ theme }) => theme.colors.positive};
  margin-top: 8px;
`
const PasswordMismatch = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  margin-top: 8px;
`

const PasswordContents = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  max-width: 416px;
`
const ValidationRulesSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  margin: 16px 0 24px;
  padding: 8px 24px;
  & div {
    padding: 8px 0;
    display: flex;
    align-items: center;
    & span {
      margin-left: 8px;
    }
  }
`

type State = {
  newPassword: string
  confirmPassword: string
  validLength: boolean
  hasNumber: boolean
  hasCases: boolean
  passwordMismatched: boolean
  passwordMatched: boolean
  continuePressed: boolean
}

type IFullProps = RouteComponentProps & IntlShapeProps

class UpdatePasswordComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      newPassword: '',
      confirmPassword: '',
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      continuePressed: false
    }
  }
  validateLength = (value: string) => {
    this.setState(() => ({
      validLength: value.length >= 12
    }))
  }
  validateNumber = (value: string) => {
    this.setState(() => ({
      hasNumber: /\d/.test(value)
    }))
  }
  validateCases = (value: string) => {
    this.setState(() => ({
      hasCases: /[a-z]/.test(value) && /[A-Z]/.test(value)
    }))
  }
  checkPasswordStrength = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      newPassword: value,
      confirmPassword: '',
      passwordMatched: false,
      passwordMismatched: false,
      continuePressed: false
    }))
    this.validateLength(value)
    this.validateNumber(value)
    this.validateCases(value)
  }
  matchPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = this.state.newPassword
    const value = event.target.value
    this.setState(() => ({
      confirmPassword: value,
      passwordMismatched: value.length > 0 && newPassword !== value,
      passwordMatched: value.length > 0 && newPassword === value,
      continuePressed: false
    }))
  }
  whatNext = async (event: React.FormEvent) => {
    event.preventDefault()
    this.setState(() => ({
      continuePressed: true,
      passwordMismatched:
        this.state.newPassword.length > 0 &&
        this.state.newPassword !== this.state.confirmPassword
    }))

    if (
      this.state.passwordMatched &&
      this.state.hasCases &&
      this.state.hasNumber &&
      this.state.validLength
    ) {
      // { nonce: string }
      await authApi.changePassword(
        this.props.router.location.state.nonce,
        this.state.newPassword
      )
      this.props.router.navigate(routes.SUCCESS, {
        state: { forgottenItem: FORGOTTEN_ITEMS.PASSWORD }
      })
    }
  }
  render = () => {
    const { intl, router } = this.props
    const forgottenItem = FORGOTTEN_ITEMS.PASSWORD

    return (
      <>
        <Frame
          header={
            <AppBar
              desktopLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={() =>
                    router.navigate(routes.PHONE_NUMBER_VERIFICATION, {
                      state: { forgottenItem }
                    })
                  }
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={() =>
                    router.navigate(routes.PHONE_NUMBER_VERIFICATION, {
                      state: { forgottenItem }
                    })
                  }
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileTitle={intl.formatMessage(
                messages.credentialsResetFormTitle,
                {
                  forgottenItem
                }
              )}
              desktopTitle={intl.formatMessage(
                messages.credentialsResetFormTitle,
                {
                  forgottenItem
                }
              )}
            />
          }
          skipToContentText={intl.formatMessage(
            constantsMessages.skipToMainContent
          )}
        >
          <form id="password-update-form" onSubmit={this.whatNext}>
            <Content
              size={ContentSize.SMALL}
              title={intl.formatMessage(messages.passwordUpdateFormBodyHeader)}
              showTitleOnMobile
              subtitle={intl.formatMessage(
                messages.passwordUpdateFormBodySubheader
              )}
              bottomActionButtons={[
                <Button
                  key="1"
                  id="continue-button"
                  onClick={this.whatNext}
                  type="primary"
                  size="large"
                >
                  {intl.formatMessage(messages.confirmButtonLabel)}
                </Button>
              ]}
            >
              <GlobalError id="GlobalError">
                {this.state.continuePressed &&
                  this.state.passwordMismatched && (
                    <WarningMessage>
                      {intl.formatMessage(messages.mismatchedPasswordMsg)}
                    </WarningMessage>
                  )}
                {this.state.continuePressed &&
                  this.state.newPassword.length === 0 && (
                    <WarningMessage>
                      {intl.formatMessage(messages.passwordRequiredMsg)}
                    </WarningMessage>
                  )}
              </GlobalError>
              <PasswordContents>
                <InputField
                  id="newPassword"
                  label={intl.formatMessage(messages.newPasswordLabel)}
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <TextInput
                    id="NewPassword"
                    type="password"
                    touched={true}
                    value={this.state.newPassword}
                    onChange={this.checkPasswordStrength}
                    error={
                      this.state.continuePressed &&
                      this.state.newPassword.length === 0
                    }
                  />
                </InputField>
                <ValidationRulesSection>
                  <div>
                    {intl.formatMessage(
                      messages.passwordUpdateFormValidationMsg
                    )}
                  </div>
                  <div>
                    {this.state.validLength && <TickOn />}
                    {!this.state.validLength && <TickOff />}
                    <span>
                      {intl.formatMessage(
                        messages.passwordLengthCharacteristicsForPasswordUpdateForm,
                        { min: 12 }
                      )}
                    </span>
                  </div>
                  <div>
                    {this.state.hasCases && <TickOn />}
                    {!this.state.hasCases && <TickOff />}
                    <span>
                      {intl.formatMessage(
                        messages.passwordCaseCharacteristicsForPasswordUpdateForm
                      )}
                    </span>
                  </div>
                  <div>
                    {this.state.hasNumber && <TickOn />}
                    {!this.state.hasNumber && <TickOff />}
                    <span>
                      {intl.formatMessage(
                        messages.passwordNumberCharacteristicsForPasswordUpdateForm
                      )}
                    </span>
                  </div>
                </ValidationRulesSection>

                <InputField
                  id="newPassword"
                  label={intl.formatMessage(messages.confirmPasswordLabel)}
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <TextInput
                    id="ConfirmPassword"
                    type="password"
                    touched={true}
                    error={
                      this.state.continuePressed &&
                      this.state.passwordMismatched
                    }
                    value={this.state.confirmPassword}
                    onChange={this.matchPassword}
                  />
                </InputField>
                {this.state.passwordMismatched && (
                  <PasswordMismatch>
                    {intl.formatMessage(messages.mismatchedPasswordMsg)}
                  </PasswordMismatch>
                )}
                {this.state.passwordMatched && (
                  <PasswordMatch>
                    {intl.formatMessage(messages.matchedPasswordMsg)}
                  </PasswordMatch>
                )}
              </PasswordContents>
            </Content>
          </form>
        </Frame>
      </>
    )
  }
}

export const UpdatePassword = withRouter(injectIntl(UpdatePasswordComponent))
