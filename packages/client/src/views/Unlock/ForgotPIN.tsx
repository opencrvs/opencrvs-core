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
import React, {
  ChangeEvent,
  FocusEventHandler,
  useCallback,
  useState
} from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { storage } from '@client/storage'
import { SCREEN_LOCK } from '@client/components/ProtectedPage'
import { SECURITY_PIN_EXPIRED_AT } from '@client/utils/constants'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { Button } from '@opencrvs/components/lib/Button'
import { getUserDetails } from '@client/profile/profileSelectors'
import { InputField } from '@opencrvs/components/lib/InputField'
import { PasswordInput } from '@opencrvs/components/lib/PasswordInput'
import { injectIntl, useIntl, WrappedComponentProps } from 'react-intl'
import {
  buttonMessages,
  constantsMessages,
  errorMessages,
  userMessages
} from '@client/i18n/messages'
import { userQueries } from '@client/user/queries'
import { AvatarLarge } from '@client/components/Avatar'
import { getUserName } from '@client/utils/userUtils'
import { getLanguage } from '@client/i18n/selectors'
import { Box, Link, Stack, Toast } from '@opencrvs/components'
import { Icon } from '@opencrvs/components/lib/Icon'
import { BackgroundWrapper } from '@client/views/common/Common'

interface IForgotPINProps {
  goBack: () => void
  onVerifyPassword: () => void
}

const StyledForm = styled.form`
  width: 100%;
`

const VerifyButton = styled(Button)`
  width: 100%;
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
  const language = useSelector(getLanguage)
  const onForgetPassword = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      logout()
      window.location.assign(
        window.config.LOGIN_URL + `/forgotten-item?lang=${language}`
      )
    },
    [language, logout]
  )

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

        if (data && data.verifyPasswordById) {
          setVerifyingPassword(false)
          setError('')
          props.onVerifyPassword()
        }
      } catch (e) {
        setVerifyingPassword(false)
        setError(intl.formatMessage(errorMessages.passwordSubmissionError))
      }
    },
    [password, userDetails, intl, props]
  )

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }, [])

  const onBlur = useCallback(() => {
    setTouched(true)
  }, [])

  return (
    <BackgroundWrapper id="forgotPinPage">
      <Box id="Box">
        <Stack direction="row" justifyContent="space-between">
          <Button type="icon" id="action_back" onClick={props.goBack}>
            <Icon name="ArrowLeft" />
          </Button>
          <Button type="icon" onClick={logout} id="logout">
            <Icon name="SignOut" />
          </Button>
        </Stack>
        <Stack direction="column">
          <AvatarLarge
            name={getUserName(userDetails)}
            avatar={userDetails?.avatar}
          />
        </Stack>

        <StyledForm id="password_verification_form" onSubmit={onSubmit}>
          <Stack
            direction="column"
            gap={18}
            alignItems="stretch"
            className="button-group"
          >
            <Password
              id="password"
              meta={{ touched, error }}
              input={{
                onChange,
                onBlur,
                value: password
              }}
            />
            <VerifyButton
              loading={verifyingPassword}
              type="primary"
              id="form_submit"
            >
              {intl.formatMessage(buttonMessages.verify)}
            </VerifyButton>
            <Link id="forgot_password" onClick={onForgetPassword}>
              {intl.formatMessage(buttonMessages.forgotPassword)}
            </Link>
          </Stack>
        </StyledForm>

        {error && (
          <Toast type="error" id="form_error" onClose={() => setError('')}>
            {error}
          </Toast>
        )}
      </Box>
    </BackgroundWrapper>
  )
}
