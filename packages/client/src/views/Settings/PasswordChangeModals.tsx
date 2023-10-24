import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { EMPTY_STRING } from '@client/utils/constants'
import { UserDetails } from '@client/utils/userUtils'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { buttonMessages, userMessages as messages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
import styled from 'styled-components'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'

const Message = styled.div`
  margin-bottom: 16px;
`

const PasswordContents = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  max-width: 100%;
  & input {
    width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    max-width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
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
  margin: 30px 0px;
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
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.positive};
  margin-top: 8px;
`
const PasswordMismatch = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.negative};
  margin-top: 8px;
`

const Field = styled.div`
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`

type State = {
  currentPassword: string
  incorrectCurrentPassword: boolean
  newPassword: string
  confirmPassword: string
  validLength: boolean
  hasNumber: boolean
  hasCases: boolean
  passwordMismatched: boolean
  passwordMatched: boolean
  errorOccured: boolean
  currentStepModal: 1 | 2
}

interface IProps {
  showPasswordChange: boolean
  togglePasswordChangeModal: () => void
  passwordChanged: () => void
  userDetails: UserDetails | null
}
type IFullProps = IProps & IntlShapeProps

class PasswordChangeModalsComp extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      currentPassword: EMPTY_STRING,
      incorrectCurrentPassword: false,
      newPassword: EMPTY_STRING,
      confirmPassword: EMPTY_STRING,
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      errorOccured: false,
      currentStepModal: 1
    }
  }

  togglePasswordChangeModals() {
    this.setState(() => ({
      currentPassword: EMPTY_STRING,
      incorrectCurrentPassword: false,
      newPassword: EMPTY_STRING,
      confirmPassword: EMPTY_STRING,
      validLength: false,
      hasNumber: false,
      hasCases: false,
      passwordMismatched: false,
      passwordMatched: false,
      errorOccured: false,
      currentStepModal: 1
    }))
    this.props.togglePasswordChangeModal()
  }

  setCurrentPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentPassword = event.target.value
    this.setState(() => ({ currentPassword }))
  }

  goToNextModal = () => {
    /*
      Check the current password and initiate the display of an error message
    */
    this.setState(() => ({
      currentStepModal: 2
    }))
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

  checkPasswordStrength = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      newPassword: value,
      confirmPassword: EMPTY_STRING,
      passwordMatched: false,
      passwordMismatched: false
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
      passwordMatched: value.length > 0 && newPassword === value
    }))
  }

  render() {
    const { showPasswordChange, intl } = this.props
    return (
      <>
        <Dialog
          id="check_current_password"
          title={intl.formatMessage(messages.changeCurrentPasswordTitle)}
          isOpen={showPasswordChange && this.state.currentStepModal === 1}
          onClose={() => this.togglePasswordChangeModals()}
          actions={[
            <Button
              type="tertiary"
              size="medium"
              id="cancel_current_password_modal"
              key="cancel_current_password_modal"
              onClick={() => this.togglePasswordChangeModals()}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="primary"
              size="medium"
              id="confirm_current_password_modal"
              key="confirm_current_password_modal"
              onClick={() => this.goToNextModal()}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </Button>
          ]}
        >
          <PasswordContents>
            <Field>
              <InputField
                id="currentPassword"
                touched={true}
                required={false}
                optionalLabel=""
                error={
                  this.state.incorrectCurrentPassword
                    ? intl.formatMessage(messages.incorrectPassword)
                    : ''
                }
              >
                <TextInput
                  id="CurrentPassword"
                  type="password"
                  touched={true}
                  value={this.state.currentPassword}
                  onChange={this.setCurrentPassword}
                />
              </InputField>
            </Field>
          </PasswordContents>
        </Dialog>
        <Dialog
          id="new_password"
          title={intl.formatMessage(messages.changeNewPasswordTitle)}
          isOpen={showPasswordChange && this.state.currentStepModal === 2}
          onClose={() => this.togglePasswordChangeModals()}
          actions={[
            <Button
              type="tertiary"
              size="medium"
              id="cancel_new_password_modal"
              key="cancel_new_password_modal"
              onClick={() => this.togglePasswordChangeModals()}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              type="primary"
              size="medium"
              id="confirm_new_password_modal"
              key="confirm_new_password_modal"
              // onClick={this.approveCorrectionAction}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </Button>
          ]}
        >
          <Message>
            <Text element="span" variant="reg18">
              {intl.formatMessage(messages.changePasswordMessage)}
            </Text>
          </Message>
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
                  {intl.formatMessage(messages.passwordUpdateFormValidationMsg)}
                </div>
                <div>
                  {this.state.validLength && <TickOn />}
                  {!this.state.validLength && <TickOff />}
                  <span>
                    {intl.formatMessage(
                      messages.passwordLengthCharacteristicsForPasswordUpdateForm,
                      {
                        min: intl.formatMessage({
                          defaultMessage: '8',
                          description: 'Minimum length password',
                          id: 'number.eight'
                        })
                      }
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
                    {
                      min: intl.formatMessage({
                        defaultMessage: '8',
                        description: 'Minimum length password',
                        id: 'number.eight'
                      })
                    }
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
                  error={this.state.passwordMismatched}
                  value={this.state.confirmPassword}
                  onChange={this.matchPassword}
                />
              </InputField>
              {this.state.passwordMismatched && (
                <PasswordMismatch id="passwordMismatch">
                  {intl.formatMessage(messages.mismatchedPasswordMsg)}
                </PasswordMismatch>
              )}
              {this.state.passwordMatched && (
                <PasswordMatch id="passwordMatch">
                  {intl.formatMessage(messages.matchedPasswordMsg)}
                </PasswordMatch>
              )}
            </Field>
          </PasswordContents>
        </Dialog>
      </>
    )
  }
}

const mapStateToProps = (state: IStoreState) => {
  return {
    userDetails: getUserDetails(state)
  }
}
export const PasswordChangeModals = connect(mapStateToProps)(
  injectIntl(PasswordChangeModalsComp)
)
