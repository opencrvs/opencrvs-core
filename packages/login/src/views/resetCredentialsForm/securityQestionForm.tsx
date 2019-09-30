import { goBack } from '@login/login/actions'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { SubPage } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Title } from './commons'
import { messages } from './resetCredentialsForm'

const Actions = styled.div`
  padding: 32px 0;
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps {
  goBack: typeof goBack
}
interface State {
  answer: string
  touched: boolean
  error: boolean
}

type Props = BaseProps & WrappedComponentProps

class SecurityQuestionComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      answer: '',
      touched: false,
      error: false
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: value === '',
      answer: value,
      touched: true
    })
  }

  handleContinue = () => {}

  render() {
    const { intl, goBack } = this.props

    return (
      <>
        <SubPage
          title={intl.formatMessage(messages.passwordResetFormTitle)}
          emptyTitle={intl.formatMessage(messages.passwordResetFormTitle)}
          goBack={goBack}
        >
          <Title></Title>
          {intl.formatMessage(
            messages.passwordResetSecurityQuestionFormBodySubheader
          )}

          <Actions id="security-answer">
            <InputField
              id="security-answer"
              key="securityAnswerFieldContainer"
              label={this.props.intl.formatMessage(messages.answerFieldLabel)}
              touched={this.state.touched}
              error={
                this.state.error
                  ? this.props.intl.formatMessage(messages.error)
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

          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(messages.continueButtonLabel)}
          </PrimaryButton>
        </SubPage>
      </>
    )
  }
}

export const SecurityQuestion = connect(
  null,
  {
    goBack
  }
)(injectIntl(SecurityQuestionComponent))
