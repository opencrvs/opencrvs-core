import { goBack, goToUpdatePasswordForm } from '@login/login/actions'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { SubPage } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Title } from './commons'
import { messages as sharedMessages } from './resetCredentialsForm'
import {
  authApi,
  IVerifySecurityAnswerResponse,
  QUESTION_KEYS
} from '@login/utils/authApi'
import { RouteComponentProps, withRouter } from 'react-router'

const Actions = styled.div`
  padding: 32px 0;
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
    { nonce: string; securityQuestionKey: QUESTION_KEYS }
  > {
  goBack: typeof goBack
  goToUpdatePasswordForm: typeof goToUpdatePasswordForm
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
      this.props.goToUpdatePasswordForm(result.nonce)
    } catch (error) {
      // @todo error handling
    }
  }

  render() {
    const { intl, goBack } = this.props

    return (
      <>
        <SubPage
          title={intl.formatMessage(sharedMessages.passwordResetFormTitle)}
          emptyTitle={intl.formatMessage(sharedMessages.passwordResetFormTitle)}
          goBack={goBack}
        >
          <form onSubmit={this.handleContinue}>
            <Title>
              {intl.formatMessage(messages[this.state.questionKey])}
            </Title>
            {intl.formatMessage(
              sharedMessages.passwordResetSecurityQuestionFormBodySubheader
            )}

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
                  onChange={e => this.handleChange(e.target.value)}
                  touched={this.state.touched}
                  error={this.state.error}
                />
              </InputField>
            </Actions>

            <PrimaryButton id="continue">
              {intl.formatMessage(sharedMessages.continueButtonLabel)}
            </PrimaryButton>
          </form>
        </SubPage>
      </>
    )
  }
}

export const SecurityQuestion = withRouter(
  connect(
    null,
    {
      goBack,
      goToUpdatePasswordForm
    }
  )(injectIntl(SecurityQuestionComponent))
)
