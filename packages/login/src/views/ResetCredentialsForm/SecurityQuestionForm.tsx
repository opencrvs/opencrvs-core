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
import {
  authApi,
  IVerifySecurityAnswerResponse,
  QUESTION_KEYS
} from '@login/utils/authApi'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'
import { messages as sharedMessages } from '@login/i18n/messages/views/resetCredentialsForm'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { constantsMessages } from '@login/i18n/messages/constants'
import { useLocation, useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

const messages = {
  BIRTH_TOWN: {
    defaultMessage: 'What city were you born in?',
    description: 'The description for BIRTH_TOWN key',
    id: 'userSetup.securityQuestions.birthTown'
  },
  FAVORITE_FOOD: {
    defaultMessage: 'What is your favorite food?',
    description: 'The description for FAVORITE_FOOD key',
    id: 'userSetup.securityQuestions.favoriteFood'
  },
  FAVORITE_MOVIE: {
    defaultMessage: 'What is your favorite movie?',
    description: 'The description for FAVORITE_MOVIE key',
    id: 'userSetup.securityQuestions.favoriteMovie'
  },
  FAVORITE_SONG: {
    defaultMessage: 'What is your favorite song?',
    description: 'The description for FAVORITE_SONG key',
    id: 'userSetup.securityQuestions.favoriteSong'
  },
  FAVORITE_TEACHER: {
    defaultMessage: 'What is the name of your favorite school teacher?',
    description: 'The description for FAVORITE_TEACHER key',
    id: 'userSetup.securityQuestions.favoriteTeacher'
  },
  FIRST_CHILD_NAME: {
    defaultMessage: "What is your first child's name?",
    description: 'The description for FIRST_CHILD_NAME key',
    id: 'userSetup.securityQuestions.firstChildName'
  },
  HIGH_SCHOOL: {
    defaultMessage: 'What is the name of your high school?',
    description: 'The description for HIGH_SCHOOL key',
    id: 'userSetup.securityQuestions.hightSchool'
  },
  MOTHER_NAME: {
    defaultMessage: "What is your mother's name?",
    description: 'The description for MOTHER_NAME key',
    id: 'userSetup.securityQuestions.motherName'
  }
}

type Props = WrappedComponentProps

const SecurityQuestionComponent = ({ intl }: Props) => {
  const [answer, setAnswer] = useState<string>('')
  const [touched, setTouched] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  const location = useLocation()
  const navigate = useNavigate()

  const [questionKey, setQuestionKey] = useState<QUESTION_KEYS>(
    location.state.securityQuestionKey
  )

  const handleChange = (value: string) => {
    setAnswer(value)
    setTouched(true)
    setError(value === '')
  }

  const handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!answer) {
      setTouched(true)
      return setError(true)
    }

    if (error) return

    let result: IVerifySecurityAnswerResponse

    try {
      result = await authApi.verifySecurityAnswer(location.state.nonce, answer)

      if (!result.matched) {
        return setQuestionKey(result.securityQuestionKey)
      }
      if (location.state.forgottenItem === FORGOTTEN_ITEMS.USERNAME) {
        await authApi.sendUserName(location.state.nonce)
        return navigate(routes.SUCCESS, {
          state: { forgottenItem: location.state.forgottenItem }
        })
      }

      navigate(routes.UPDATE_PASSWORD, { state: { nonce: result.nonce } })
    } catch (error) {
      // @todo error handling
      setError(true)
    }
  }

  const { forgottenItem } = location.state

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
                  navigate(routes.PHONE_NUMBER_VERIFICATION, {
                    state: forgottenItem
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
                  navigate(routes.PHONE_NUMBER_VERIFICATION, {
                    state: forgottenItem
                  })
                }
              >
                <Icon name="ArrowLeft" />
              </Button>
            }
            mobileTitle={intl.formatMessage(
              sharedMessages.credentialsResetFormTitle,
              {
                forgottenItem
              }
            )}
            desktopTitle={intl.formatMessage(
              sharedMessages.credentialsResetFormTitle,
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
        <form id="security-question-form" onSubmit={handleContinue}>
          <Content
            size={ContentSize.SMALL}
            title={intl.formatMessage(messages[questionKey])}
            showTitleOnMobile
            subtitle={intl.formatMessage(
              sharedMessages.securityQuestionFormBodySubheader
            )}
            bottomActionButtons={[
              <Button
                key="1"
                id="continue"
                onClick={handleContinue}
                type="primary"
                size="large"
              >
                {intl.formatMessage(sharedMessages.continueButtonLabel)}
              </Button>
            ]}
          >
            <Actions id="security-answer">
              <InputField
                id="security-answer"
                key="securityAnswerFieldContainer"
                label={intl.formatMessage(sharedMessages.answerFieldLabel)}
                touched={touched}
                error={error ? intl.formatMessage(sharedMessages.error) : ''}
                hideAsterisk={true}
              >
                <TextInput
                  id="security-answer-input"
                  type="text"
                  key="securityAnswerInputField"
                  name="securityAnswerInput"
                  isSmallSized={true}
                  value={answer}
                  onChange={(e) => handleChange(e.target.value)}
                  touched={touched}
                  error={error}
                />
              </InputField>
            </Actions>
          </Content>
        </form>
      </Frame>
    </>
  )
}

export const SecurityQuestion = injectIntl(SecurityQuestionComponent)
