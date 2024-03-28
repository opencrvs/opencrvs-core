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
import * as React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { WarningMessage } from '@opencrvs/components/lib/WarningMessage'
import { TickOff, TickOn } from '@opencrvs/components/lib/icons'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData
} from '@client/components/ProtectedAccount'
import { messages } from '@client/i18n/messages/views/userSetup'
import { buttonMessages } from '@client/i18n/messages'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { EMPTY_STRING } from '@client/utils/constants'

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
interface IProps {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}

export function CreatePassword({ setupData, goToStep }: IProps) {
  const intl = useIntl()
  const [newPassword, setNewPassword] = React.useState(EMPTY_STRING)
  const [confirmPassword, setConfirmPassword] = React.useState(EMPTY_STRING)
  const [validLength, setValidLength] = React.useState(false)
  const [hasNumber, setHasNumber] = React.useState(false)
  const [hasCases, setHasCases] = React.useState(false)
  const [passwordMismatched, setPasswordMismatched] = React.useState(false)
  const [passwordMatched, setPasswordMatched] = React.useState(false)
  const [continuePressed, setContinuePressed] = React.useState(false)

  const validateLength = (value: string) => {
    setValidLength(value.length >= 12)
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
    setConfirmPassword(EMPTY_STRING)
    setPasswordMatched(false)
    setPasswordMismatched(false)
    setContinuePressed(false)
    validateLength(value)
    validateNumber(value)
    validateCases(value)
  }
  const matchPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setConfirmPassword(value)
    setPasswordMismatched(value.length > 0 && newPassword !== value)
    setPasswordMatched(value.length > 0 && newPassword === value)
    setContinuePressed(false)
  }
  const whatNext = () => {
    setContinuePressed(true)
    setPasswordMismatched(
      newPassword.length > 0 && newPassword !== confirmPassword
    )
    if (passwordMatched && hasCases && hasNumber && validLength) {
      setupData.password = newPassword
      goToStep(ProtectedAccoutStep.SECURITY_QUESTION, {
        ...setupData,
        password: newPassword
      })
    }
  }

  const continueActionButton = (
    <PrimaryButton
      id="Continue"
      onClick={whatNext}
      disabled={!hasCases || !hasNumber || !validLength}
    >
      {intl.formatMessage(buttonMessages.continueButton)}
    </PrimaryButton>
  )

  return (
    <>
      <ActionPageLight
        title={intl.formatMessage(messages.newPassword)}
        hideBackground
        goBack={() => {
          goToStep(ProtectedAccoutStep.LANDING, setupData)
        }}
      >
        <Content
          size={ContentSize.SMALL}
          title={intl.formatMessage(messages.header)}
          showTitleOnMobile
          subtitle={intl.formatMessage(messages.instruction)}
          bottomActionButtons={[continueActionButton]}
        >
          <GlobalError id="GlobalError">
            {continuePressed && passwordMismatched && (
              <WarningMessage>
                {intl.formatMessage(messages.mismatch)}
              </WarningMessage>
            )}
            {continuePressed && newPassword.length === 0 && (
              <WarningMessage>
                {intl.formatMessage(messages.passwordRequired)}
              </WarningMessage>
            )}
          </GlobalError>
          <PasswordContents>
            <InputField
              id="newPassword"
              label={intl.formatMessage(messages.newPassword)}
              touched={true}
              required={false}
              optionalLabel=""
            >
              <TextInput
                id="NewPassword"
                type="password"
                touched={true}
                value={newPassword}
                onChange={checkPasswordStrength}
                error={continuePressed && newPassword.length === 0}
              />
            </InputField>
            <ValidationRulesSection>
              <div>{intl.formatMessage(messages.validationMsg)}</div>
              <div>
                {validLength && <TickOn />}
                {!validLength && <TickOff />}
                <span>
                  {intl.formatMessage(messages.minLength, { min: 12 })}
                </span>
              </div>
              <div>
                {hasCases && <TickOn />}
                {!hasCases && <TickOff />}
                <span>{intl.formatMessage(messages.hasCases)}</span>
              </div>
              <div>
                {hasNumber && <TickOn />}
                {!hasNumber && <TickOff />}
                <span>{intl.formatMessage(messages.hasNumber)}</span>
              </div>
            </ValidationRulesSection>

            <InputField
              id="newPassword"
              label={intl.formatMessage(messages.confirmPassword)}
              touched={true}
              required={false}
              optionalLabel=""
            >
              <TextInput
                id="ConfirmPassword"
                type="password"
                touched={true}
                error={continuePressed && passwordMismatched}
                value={confirmPassword}
                onChange={matchPassword}
              />
            </InputField>
            {passwordMismatched && (
              <PasswordMismatch>
                {intl.formatMessage(messages.mismatch)}
              </PasswordMismatch>
            )}
            {passwordMatched && (
              <PasswordMatch>
                {intl.formatMessage(messages.match)}
              </PasswordMatch>
            )}
          </PasswordContents>
        </Content>
      </ActionPageLight>
    </>
  )
}
