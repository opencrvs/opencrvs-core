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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { ErrorMessage } from '@opencrvs/components/lib/ErrorMessage'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { userMessages as messages } from '@client/i18n/messages'
import { getUserDetails } from '@client/profile/profileSelectors'
import styled from 'styled-components'
import { EMPTY_STRING } from '@client/utils/constants'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useUsers } from '@client/v2-events/hooks/useUsers'

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
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.positive};
  margin-top: 8px;
`
const PasswordMismatch = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.negative};
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

const BoxedError = styled.div`
  margin-bottom: 10px;
  display: flex;
`

interface IProps {
  showPasswordChange: boolean
  togglePasswordChangeModal: () => void
  passwordChanged: () => void
}

export function PasswordChangeModal({
  showPasswordChange,
  togglePasswordChangeModal,
  passwordChanged
}: IProps) {
  const intl = useIntl()
  const userDetails = useSelector(getUserDetails)
  const { changePassword: changePasswordMutation } = useUsers()

  const [currentPassword, setCurrentPasswordValue] =
    React.useState(EMPTY_STRING)
  const [newPassword, setNewPassword] = React.useState(EMPTY_STRING)
  const [confirmPassword, setConfirmPassword] = React.useState(EMPTY_STRING)
  const [validLength, setValidLength] = React.useState(false)
  const [hasNumber, setHasNumber] = React.useState(false)
  const [hasCases, setHasCases] = React.useState(false)
  const [passwordMismatched, setPasswordMismatched] = React.useState(false)
  const [passwordMatched, setPasswordMatched] = React.useState(false)
  const [errorOccured, setErrorOccured] = React.useState(false)

  const resetState = () => {
    setCurrentPasswordValue(EMPTY_STRING)
    setNewPassword(EMPTY_STRING)
    setConfirmPassword(EMPTY_STRING)
    setValidLength(false)
    setHasNumber(false)
    setHasCases(false)
    setPasswordMismatched(false)
    setPasswordMatched(false)
    setErrorOccured(false)
  }

  const handleSetCurrentPassword = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPasswordValue(event.target.value)
  }

  const checkPasswordStrength = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setNewPassword(value)
    setConfirmPassword(EMPTY_STRING)
    setPasswordMatched(false)
    setPasswordMismatched(false)
    setValidLength(value.length >= 12)
    setHasNumber(/\d/.test(value))
    setHasCases(/[a-z]/.test(value) && /[A-Z]/.test(value))
  }

  const matchPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setConfirmPassword(value)
    setPasswordMismatched(value.length > 0 && newPassword !== value)
    setPasswordMatched(value.length > 0 && newPassword === value)
  }

  const hideModal = () => {
    setCurrentPasswordValue(EMPTY_STRING)
    setNewPassword(EMPTY_STRING)
    setConfirmPassword(EMPTY_STRING)
    togglePasswordChangeModal()
  }

  const handleChangePassword = () => {
    if (
      passwordMatched &&
      currentPassword &&
      hasCases &&
      hasNumber &&
      validLength &&
      userDetails
    ) {
      changePasswordMutation.mutate(
        {
          userId: userDetails.id,
          existingPassword: currentPassword,
          password: newPassword
        },
        {
          onSuccess: () => {
            resetState()
            passwordChanged()
          },
          onError: () => {
            setErrorOccured(true)
          }
        }
      )
    }
  }

  return (
    <ResponsiveModal
      id="ChangePasswordModal"
      title={intl.formatMessage(messages.changePassword)}
      show={showPasswordChange}
      contentHeight={420}
      actions={[
        <PrimaryButton
          id="confirm-button"
          key="confirm"
          onClick={handleChangePassword}
          disabled={
            !Boolean(currentPassword.length) ||
            !hasCases ||
            !hasNumber ||
            !validLength ||
            !passwordMatched
          }
        >
          {intl.formatMessage(messages.confirmButtonLabel)}
        </PrimaryButton>
      ]}
      width={1000}
      handleClose={hideModal}
    >
      <Message>{intl.formatMessage(messages.changePasswordMessage)}</Message>

      <form
        id="password-update-modal-form"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Row>
          <PasswordContents>
            <BoxedError>
              {errorOccured && (
                <ErrorMessage>
                  {intl.formatMessage(messages.incorrectPassword)}
                </ErrorMessage>
              )}
            </BoxedError>

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
                  value={currentPassword}
                  onChange={handleSetCurrentPassword}
                />
              </InputField>
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
                          defaultMessage: '12',
                          description: 'Minimum length password',
                          id: 'number.twelve'
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
                      defaultMessage: '12',
                      description: 'Minimum length password',
                      id: 'number.twelve'
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
        </Row>
      </form>
    </ResponsiveModal>
  )
}
