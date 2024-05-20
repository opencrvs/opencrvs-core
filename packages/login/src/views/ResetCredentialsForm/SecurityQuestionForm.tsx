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
import {
  FORGOTTEN_ITEMS,
  goToPhoneNumberVerificationForm,
  goToSuccessPage,
  goToUpdatePasswordForm
} from '@login/login/actions'
import {
  authApi,
  IVerifySecurityAnswerResponse,
  QUESTION_KEYS
} from '@login/utils/authApi'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'
import { messages as sharedMessages } from '@login/i18n/messages/views/resetCredentialsForm'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { constantsMessages } from '@login/i18n/messages/constants'

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

interface BaseProps
  extends RouteComponentProps<
    {},
    {},
    {
      forgottenItem: FORGOTTEN_ITEMS
      nonce: string
      securityQuestionKey: QUESTION_KEYS
    }
  > {
  goToPhoneNumberVerificationForm: typeof goToPhoneNumberVerificationForm
  goToUpdatePasswordForm: typeof goToUpdatePasswordForm
  goToSuccessPage: typeof goToSuccessPage
}
interface State {
  answer: string
  touched: boolean
  error: boolean
  questionKey: QUESTION_KEYS
}

type Props = BaseProps & WrappedComponentProps

class SecurityQuestionComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      answer: '',
      touched: false,
      error: false,
      questionKey: props.location.state.securityQuestionKey
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: value === '',
      answer: value,
      touched: true
    })
  }

  handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!this.state.answer) {
      this.setState({
        touched: true,
        error: true
      })
      return
    }
    if (this.state.error) {
      return
    }

    let result: IVerifySecurityAnswerResponse

    try {
      result = await authApi.verifySecurityAnswer(
        this.props.location.state.nonce,
        this.state.answer
      )

      if (!result.matched) {
        this.setState({ questionKey: result.securityQuestionKey })
        return
      }
      if (
        this.props.location.state.forgottenItem === FORGOTTEN_ITEMS.USERNAME
      ) {
        await authApi.sendUserName(this.props.location.state.nonce)
        this.props.goToSuccessPage(this.props.location.state.forgottenItem)
      } else {
        this.props.goToUpdatePasswordForm(result.nonce)
      }
    } catch (error) {
      // @todo error handling
      this.setState({ error: true })
    }
  }

  render() {
    const { intl, goToPhoneNumberVerificationForm } = this.props
    const { forgottenItem } = this.props.location.state

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
                  onClick={() => goToPhoneNumberVerificationForm(forgottenItem)}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={() => goToPhoneNumberVerificationForm(forgottenItem)}
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
          <form id="security-question-form" onSubmit={this.handleContinue}>
            <Content
              title={intl.formatMessage(messages[this.state.questionKey])}
              showTitleOnMobile
              subtitle={intl.formatMessage(
                sharedMessages.securityQuestionFormBodySubheader
              )}
              bottomActionButtons={[
                <Button
                  key="1"
                  id="continue"
                  onClick={this.handleContinue}
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
                  label={this.props.intl.formatMessage(
                    sharedMessages.answerFieldLabel
                  )}
                  touched={this.state.touched}
                  error={
                    this.state.error
                      ? this.props.intl.formatMessage(sharedMessages.error)
                      : ''
                  }
                  hideAsterisk={true}
                >
                  <TextInput
                    id="security-answer-input"
                    type="text"
                    key="securityAnswerInputField"
                    name="securityAnswerInput"
                    isSmallSized={true}
                    value={this.state.answer}
                    onChange={(e) => this.handleChange(e.target.value)}
                    touched={this.state.touched}
                    error={this.state.error}
                  />
                </InputField>
              </Actions>
            </Content>
          </form>
        </Frame>
      </>
    )
  }
}

export const SecurityQuestion = withRouter(
  connect(null, {
    goToPhoneNumberVerificationForm,
    goToUpdatePasswordForm,
    goToSuccessPage
  })(injectIntl(SecurityQuestionComponent))
)
