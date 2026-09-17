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

import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Text } from '@opencrvs/components/lib/Text'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

import { RadioButton } from '@opencrvs/components/lib/Radio'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'
import { useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

const Note = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.grey100};
  border-left: 4px solid ${({ theme }) => theme.colors.primaryBlue};
  padding: 12px 16px;
  margin-top: 16px;
  margin-bottom: 0;
`

const NoteIconWrapper = styled.div`
  flex-shrink: 0;
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.primaryBlue}; /* fallback for theme */
`

export function ActiveAccountNote({ intl }: WrappedComponentProps) {
  return (
    <Note>
      <NoteIconWrapper>
        <Icon name="Info" />
      </NoteIconWrapper>
      <Text
        id="recovery-active-account-note"
        variant="reg14"
        element="p"
        color="grey500"
        style={{ margin: 0, paddingTop: 2 }}
      >
        {intl.formatMessage(messages.recoveryActiveAccountNote)}
      </Text>
    </Note>
  )
}

const ForgottenItemComponent = ({ intl }: WrappedComponentProps) => {
  const navigate = useNavigate()

  const goToHome = () => navigate(routes.STEP_ONE)
  const [forgottenItem, setForgottenItem] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  const handleContinue = (event: React.FormEvent) => {
    event.preventDefault()
    if (forgottenItem === '') {
      return setError(true)
    }

    return navigate(routes.PHONE_NUMBER_VERIFICATION, {
      state: { forgottenItem }
    })
  }

  const forgottenItems = [
    {
      id: 'usernameOption',
      option: {
        label: intl.formatMessage(messages.usernameOptionLabel),
        value: 'username'
      }
    },
    {
      id: 'passwordOption',
      option: {
        label: intl.formatMessage(messages.passwordOptionLabel),
        value: 'password'
      }
    }
  ]

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
                onClick={goToHome}
              >
                <Icon name="ArrowLeft" />
              </Button>
            }
            mobileLeft={
              <Button
                aria-label="Go back"
                size="medium"
                type="icon"
                onClick={goToHome}
              >
                <Icon name="ArrowLeft" />
              </Button>
            }
            mobileTitle={intl.formatMessage(messages.forgottenItemFormTitle)}
            desktopTitle={intl.formatMessage(messages.forgottenItemFormTitle)}
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <form id="forgotten-item-form" onSubmit={handleContinue}>
          <Content
            size={ContentSize.SMALL}
            title={intl.formatMessage(messages.forgottenItemFormBodyHeader)}
            bottomActionButtons={[
              <Button
                key="1"
                id="continue"
                onClick={handleContinue}
                type="primary"
                size="large"
                fullWidth
              >
                {intl.formatMessage(messages.continueButtonLabel)}
              </Button>
            ]}
            showTitleOnMobile
          >
            <Actions id="forgotten-item-options">
              {error && (
                <ErrorText id="error-text">
                  {intl.formatMessage(messages.error)}
                </ErrorText>
              )}
              {forgottenItems.map((item) => {
                return (
                  <RadioButton
                    id={item.id}
                    size="large"
                    key={item.id}
                    name="forgottenItemOptions"
                    label={item.option.label}
                    value={item.option.value}
                    selected={
                      forgottenItem === item.option.value
                        ? item.option.value
                        : ''
                    }
                    onChange={() => setForgottenItem(item.option.value)}
                  />
                )
              })}
            </Actions>
            <ActiveAccountNote intl={intl} />
          </Content>
        </form>
      </Frame>
    </>
  )
}
export const ForgottenItem = injectIntl(ForgottenItemComponent)
