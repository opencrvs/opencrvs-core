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
import React, {
  useCallback,
  FocusEventHandler,
  ChangeEvent,
  useState
} from 'react'
import {
  PageWrapper as UnlockPageWrapper,
  LogoutHeader as LogoutContainer
} from '@client/views/Unlock/Unlock'
import styled from '@client/styledComponents'
import { useDispatch, useSelector } from 'react-redux'
import { storage } from '@client/storage'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { Logout, BackArrow, Logo } from '@opencrvs/components/lib/icons'
import { redirectToAuthentication } from '@client/profile/profileActions'
import {
  Button,
  PrimaryButton,
  CircleButton
} from '@opencrvs/components/lib/buttons'
import { getUserDetails } from '@client/profile/profileSelectors'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import {
  InputField,
  PasswordInput,
  THEME_MODE,
  ErrorMessage
} from '@opencrvs/components/lib/forms'
import { injectIntl, WrappedComponentProps, useIntl } from 'react-intl'
import {
  constantsMessages,
  userMessages,
  errorMessages,
  buttonMessages
} from '@client/i18n/messages'
import { userQueries } from '@client/user/queries'
import { Spinner } from '@opencrvs/components/lib/interface'
import { getDefaultLanguage } from '@client/i18n/utils'
import { getTheme } from '@opencrvs/components/lib/theme'

interface IForgotPINProps {
  goBack: () => void
}

const PageWrapper = styled(UnlockPageWrapper)`
  justify-content: flex-start;
`
const BackButton = styled(CircleButton)`
  float: left;
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  position: absolute;
  top: 30px;
  left: 20px;
  svg {
    path {
      stroke: ${({ theme }) => theme.colors.white};
    }
  }
`
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  position: relative;
`
const StyledLogo = styled(Logo)`
  margin-top: 104px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 80px;
  }
`
const Name = styled.p`
  color: ${({ theme }) => theme.colors.white};
`
const StyledForm = styled.form`
  width: 100%;
`
const ActionWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: column;
`
const ForgotPasswordLink = styled(Button)`
  ${({ theme }) => theme.fonts.buttonStyle};
  color: ${({ theme }) => theme.colors.white};
  text-transform: none;
  margin-top: 24px;
`
const SpinnerContainer = styled.div`
  margin-top: 48px;
`
type MetaProps = { touched: boolean; error: string }
type InputProps = {
  value: any
  onBlur: FocusEventHandler<HTMLInputElement>
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const Password = injectIntl(
  (
    props: {
      meta: MetaProps
      input: InputProps
      id: string
    } & WrappedComponentProps
  ) => {
    const { id, intl, meta, input } = props

    return (
      <InputField
        id={id}
        touched={meta.touched}
        label={intl.formatMessage(constantsMessages.labelPassword)}
        ignoreMediaQuery
        hideAsterisk
        mode={THEME_MODE.DARK}
      >
        <PasswordInput
          id={id}
          {...input}
          touched={meta.touched}
          error={Boolean(meta.error)}
          ignoreMediaQuery
        />
      </InputField>
    )
  }
)

export function ForgotPIN(props: IForgotPINProps) {
  const [password, setPassword] = useState<string>('')
  const [touched, setTouched] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const intl = useIntl()
  const [verifyingPassword, setVerifyingPassword] = useState<boolean>(false)

  const userDetails = useSelector(getUserDetails)
  const dispatch = useDispatch()

  const logout = useCallback(() => {
    storage.removeItem(SCREEN_LOCK)
    storage.removeItem(SECURITY_PIN_EXPIRED_AT)
    dispatch(redirectToAuthentication())
  }, [dispatch])

  const onForgetPassword = useCallback(() => {
    storage.removeItem(SCREEN_LOCK)
    storage.removeItem(SECURITY_PIN_EXPIRED_AT)
    window.location.assign(window.config.LOGIN_URL + '/forgotten-item')
  }, [])

  function showName() {
    const nameObj =
      (userDetails &&
        userDetails.name &&
        (userDetails.name.find(
          // @ts-ignore
          (storedName: GQLHumanName) => storedName.use === 'en'
        ) as GQLHumanName)) ||
      {}
    const fullName = `${String(nameObj.firstNames)} ${String(
      nameObj.familyName
    )}`
    return <Name>{fullName}</Name>
  }

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!password) {
        setTouched(true)
        setError(intl.formatMessage(userMessages.requiredfield))
        return
      }

      setVerifyingPassword(true)

      const id = (userDetails && userDetails.userMgntUserID) || ''
      try {
        const { data } = await userQueries.verifyPasswordById(id, password)

        if (data) {
          setVerifyingPassword(false)
          setError('')
          // Redirect to create pin here
        }
      } catch (e) {
        setVerifyingPassword(false)
        setError(intl.formatMessage(errorMessages.passwordSubmissionError))
      }
    },
    [password, userDetails, intl]
  )

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }, [])

  const onBlur = useCallback(() => {
    setTouched(true)
  }, [])

  return (
    <PageWrapper id="forgot_pin_page">
      <BackButton id="action_back" onClick={props.goBack}>
        <BackArrow />
      </BackButton>
      <LogoutContainer onClick={logout} id="logout">
        <span>{intl.formatMessage(buttonMessages.logout)}</span>
        <Logout />
      </LogoutContainer>
      <Container>
        <StyledLogo />
        {showName()}
        {verifyingPassword ? (
          <SpinnerContainer>
            <Spinner
              id="verifying_password_spinner"
              baseColor={getTheme(getDefaultLanguage()).colors.white}
            />
          </SpinnerContainer>
        ) : (
          <>
            {error && <ErrorMessage id="form_error">{error}</ErrorMessage>}
            <StyledForm id="password_verification_form" onSubmit={onSubmit}>
              <Password
                id="password"
                meta={{ touched, error }}
                input={{
                  onChange,
                  onBlur,
                  value: password
                }}
              />
              <ActionWrapper>
                <PrimaryButton id="form_submit">
                  {intl.formatMessage(buttonMessages.verify)}
                </PrimaryButton>
                <ForgotPasswordLink
                  type="button"
                  id="forgot_password"
                  onClick={onForgetPassword}
                >
                  {intl.formatMessage(buttonMessages.forgotPassword)}
                </ForgotPasswordLink>
              </ActionWrapper>
            </StyledForm>
          </>
        )}
      </Container>
    </PageWrapper>
  )
}
