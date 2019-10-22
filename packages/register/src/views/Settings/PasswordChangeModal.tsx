import * as React from 'react'
import styled from '@register/styledComponents'
import { connect } from 'react-redux'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  userMessages as messages,
  buttonMessages,
  constantsMessages
} from '@register/i18n/messages'
import {
  InputField,
  TextInput,
  WarningMessage
} from '@opencrvs/components/lib/forms'
import { TickOn, TickOff } from '@opencrvs/components/lib/icons'

const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`
const Message = styled.div`
  margin-bottom: 16px;
`
const PasswordContents = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  max-width: 50%;
  & input {
    width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    max-width: 80% !important;
  }
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
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const ValidationRulesSectionLg = styled.div`
  background: ${({ theme }) => theme.colors.background};
  margin: 30px 20px 24px;
  width: 100%;
  padding: 8px 24px;
  & div {
    padding: 8px 0;
    display: flex;
    align-items: center;
    & span {
      margin-left: 8px;
    }
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const PasswordMatch = styled.div`
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.success};
  margin-top: 8px;
`
const PasswordMismatch = styled.div`
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.error};
  margin-top: 8px;
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
const GlobalError = styled.div`
  color: ${({ theme }) => theme.colors.error};
`
type State = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  validLength: boolean
  hasNumber: boolean
  hasCases: boolean
  passwordMismatched: boolean
  passwordMatched: boolean
  confirmPressed: boolean
}

interface IProps {
  showPasswordChange: boolean
  togglePassworkChangeModal: () => void
  changePassword: () => void
}
type IFullProps = IProps & IntlShapeProps

class PasswordChangeModalComp extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      confirmPressed: false
    }
  }
  validateLength = (value: string) => {
    this.setState(() => ({
      validLength: value.length >= 8
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
  setCurrentPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentPassword = event.target.value
    this.setState(() => ({ currentPassword }))
  }
  checkPasswordStrength = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      newPassword: value,
      confirmPassword: '',
      passwordMatched: false,
      passwordMismatched: false,
      confirmPressed: false
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
      confirmPressed: false
    }))
  }
  changePassword = () => {
    this.setState(() => ({
      confirmPressed: true
    }))

    if (
      this.state.passwordMatched &&
      this.state.currentPassword &&
      this.state.hasCases &&
      this.state.hasNumber &&
      this.state.validLength
    ) {
      this.props.changePassword()
    }
  }
  render() {
    const { intl, showPasswordChange, togglePassworkChangeModal } = this.props
    return (
      <ResponsiveModal
        id="ChangePasswordModal"
        title={intl.formatMessage(messages.changePassword)}
        show={showPasswordChange}
        contentHeight={410}
        actions={[
          <PrimaryButton
            id="confirm-button"
            key="confirm"
            onClick={this.changePassword}
          >
            {intl.formatMessage(messages.confirmButtonLabel)}
          </PrimaryButton>
        ]}
        width={1000}
        handleClose={togglePassworkChangeModal}
      >
        <Message>{intl.formatMessage(messages.changePasswordMessage)}</Message>

        <form
          id="password-update-modal-form"
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          <Row>
            <PasswordContents>
              <Field>
                <InputField
                  id="currentPassword"
                  label={intl.formatMessage(messages.currentPassword)}
                  touched={true}
                  required={false}
                  optionalLabel=""
                >
                  <TextInput
                    id="CurrentPassword"
                    type="password"
                    touched={true}
                    value={this.state.currentPassword}
                    onChange={this.setCurrentPassword}
                    error={
                      this.state.confirmPressed &&
                      this.state.currentPassword.length === 0
                    }
                  />
                </InputField>
                {this.state.confirmPressed &&
                  this.state.currentPassword.length === 0 && (
                    <GlobalError>
                      {intl.formatMessage(messages.requiredfield)}
                    </GlobalError>
                  )}
              </Field>
            </PasswordContents>
          </Row>
          <Row>
            <PasswordContents>
              <Field>
                <InputField
                  id="newPassword"
                  label={intl.formatMessage(messages.newPasswordLabel)}
                  touched={true}
                  required={false}
                >
                  <TextInput
                    id="NewPassword"
                    type="password"
                    touched={true}
                    value={this.state.newPassword}
                    onChange={this.checkPasswordStrength}
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
                        { min: 8 }
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
              </Field>
              <Field>
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
                      this.state.confirmPressed && this.state.passwordMismatched
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
              </Field>
            </PasswordContents>
            <ValidationRulesSectionLg>
              <div>
                {intl.formatMessage(messages.passwordUpdateFormValidationMsg)}
              </div>
              <div>
                {this.state.validLength && <TickOn />}
                {!this.state.validLength && <TickOff />}
                <span>
                  {intl.formatMessage(
                    messages.passwordLengthCharacteristicsForPasswordUpdateForm,
                    { min: 8 }
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
            </ValidationRulesSectionLg>
          </Row>
        </form>
      </ResponsiveModal>
    )
  }
}

export const PasswordChangeModal = injectIntl(PasswordChangeModalComp)
