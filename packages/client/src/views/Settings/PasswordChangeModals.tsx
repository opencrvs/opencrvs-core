import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { UserDetails } from '@client/utils/userUtils'
import { Dialog } from '@opencrvs/components/lib/Dialog/Dialog'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { buttonMessages, userMessages as messages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
import styled from 'styled-components'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'
import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { userQueries } from '@client/user/queries'
import { get } from 'lodash'

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

const changePasswordMutation = gql`
  mutation changePassword(
    $userId: String!
    $existingPassword: String!
    $password: String!
  ) {
    changePassword(
      userId: $userId
      existingPassword: $existingPassword
      password: $password
    )
  }
`

interface IProps {
  showPasswordChange: boolean
  togglePasswordChangeModal: () => void
  passwordChanged: () => void
  userDetails: UserDetails | null
}

type IFullProps = IProps & IntlShapeProps

const PasswordChangeModalsComp: React.FC<IFullProps> = (props) => {
  const { showPasswordChange, intl } = props

  const [currentPassword, setCurrentPassword] = useState('')
  const [incorrectCurrentPassword, setIncorrectCurrentPassword] =
    useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validLength, setValidLength] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasCases, setHasCases] = useState(false)
  const [passwordMismatched, setPasswordMismatched] = useState(false)
  const [passwordMatched, setPasswordMatched] = useState(false)
  const [currentStepModal, setCurrentStepModal] = useState(1)

  const togglePasswordChangeModals = () => {
    setCurrentPassword('')
    setIncorrectCurrentPassword(false)
    setNewPassword('')
    setConfirmPassword('')
    setValidLength(false)
    setHasNumber(false)
    setHasCases(false)
    setPasswordMismatched(false)
    setPasswordMatched(false)
    setCurrentStepModal(1)
    props.togglePasswordChangeModal()
  }

  const handleCurrentPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setCurrentPassword(value)
  }

  const goToNextModal = async () => {
    try {
      await userQueries.verifyPasswordById(
        get(props, 'userDetails.userMgntUserID'),
        currentPassword
      )
      setCurrentStepModal(2)
    } catch (e) {
      setIncorrectCurrentPassword(true)
    }
  }

  const validateLength = (value: string) => {
    setValidLength(value.length >= 8)
  }

  const validateNumber = (value: string) => {
    setHasNumber(/\d/.test(value))
  }

  const validateCases = (value: string) => {
    setHasCases(/[a-z]/.test(value) && /[A-Z]/.test(value))
  }

  const checkPasswordStrength = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setNewPassword(value)
    setConfirmPassword('')
    setPasswordMatched(false)
    setPasswordMismatched(false)
    validateLength(value)
    validateNumber(value)
    validateCases(value)
  }

  const matchPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setConfirmPassword(value)
    setPasswordMismatched(value.length > 0 && newPassword !== value)
    setPasswordMatched(value.length > 0 && newPassword === value)
  }

  const passwordChangecompleted = () => {
    setCurrentPassword('')
    setIncorrectCurrentPassword(false)
    setNewPassword('')
    setConfirmPassword('')
    setValidLength(false)
    setHasNumber(false)
    setHasCases(false)
    setPasswordMismatched(false)
    setPasswordMatched(false)
    setCurrentStepModal(1)

    props.passwordChanged()
  }

  const changingPassword = (mutation: () => void) => {
    if (
      passwordMatched &&
      currentPassword &&
      hasCases &&
      hasNumber &&
      validLength
    ) {
      mutation()
    }
  }

  return (
    <>
      <Dialog
        id="check_current_password"
        title={intl.formatMessage(messages.changeCurrentPasswordTitle)}
        isOpen={showPasswordChange && currentStepModal === 1}
        onClose={() => togglePasswordChangeModals()}
        actions={[
          <Button
            type="tertiary"
            size="medium"
            id="cancel_current_password_modal"
            key="cancel_current_password_modal"
            onClick={() => togglePasswordChangeModals()}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            size="medium"
            id="confirm_current_password_modal"
            key="confirm_current_password_modal"
            onClick={() => goToNextModal()}
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
                incorrectCurrentPassword
                  ? intl.formatMessage(messages.incorrectPassword)
                  : ''
              }
            >
              <TextInput
                id="CurrentPassword"
                type="password"
                touched={true}
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
              />
            </InputField>
          </Field>
        </PasswordContents>
      </Dialog>
      <Dialog
        id="new_password"
        title={intl.formatMessage(messages.changeNewPasswordTitle)}
        isOpen={showPasswordChange && currentStepModal === 2}
        onClose={() => togglePasswordChangeModals()}
        actions={[
          <Button
            type="tertiary"
            size="medium"
            id="cancel_new_password_modal"
            key="cancel_new_password_modal"
            onClick={() => togglePasswordChangeModals()}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Mutation
            key="change-password-mutation"
            mutation={changePasswordMutation}
            variables={{
              userId: get(props, 'userDetails.userMgntUserID'),
              existingPassword: currentPassword,
              password: newPassword
            }}
            onCompleted={passwordChangecompleted}
          >
            {(changePassword: any) => {
              return (
                <Button
                  type="primary"
                  size="medium"
                  id="confirm_new_password_modal"
                  key="confirm_new_password_modal"
                  onClick={() => changingPassword(changePassword)}
                  disabled={
                    !Boolean(currentPassword.length) ||
                    !hasCases ||
                    !hasNumber ||
                    !validLength ||
                    !passwordMatched
                  }
                >
                  {intl.formatMessage(buttonMessages.continueButton)}
                </Button>
              )
            }}
          </Mutation>
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
                value={newPassword}
                onChange={checkPasswordStrength}
              />
            </InputField>
            <ValidationRulesSection>
              <div>
                {intl.formatMessage(messages.passwordUpdateFormValidationMsg)}
              </div>
              <div>
                {validLength && <TickOn />}
                {!validLength && <TickOff />}
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
                {hasCases && <TickOn />}
                {!hasCases && <TickOff />}
                <span>
                  {intl.formatMessage(
                    messages.passwordCaseCharacteristicsForPasswordUpdateForm
                  )}
                </span>
              </div>
              <div>
                {hasNumber && <TickOn />}
                {!hasNumber && <TickOff />}
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
              {validLength && <TickOn />}
              {!validLength && <TickOff />}
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
              {hasCases && <TickOn />}
              {!hasCases && <TickOff />}
              <span>
                {intl.formatMessage(
                  messages.passwordCaseCharacteristicsForPasswordUpdateForm
                )}
              </span>
            </div>
            <div>
              {hasNumber && <TickOn />}
              {!hasNumber && <TickOff />}
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
                error={passwordMismatched}
                value={confirmPassword}
                onChange={matchPassword}
              />
            </InputField>
            {passwordMismatched && (
              <PasswordMismatch id="passwordMismatch">
                {intl.formatMessage(messages.mismatchedPasswordMsg)}
              </PasswordMismatch>
            )}
            {passwordMatched && (
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

const mapStateToProps = (state: IStoreState) => {
  return {
    userDetails: getUserDetails(state)
  }
}
export const PasswordChangeModals = connect(mapStateToProps)(
  injectIntl(PasswordChangeModalsComp)
)
