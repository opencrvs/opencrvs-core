import {
  FORGOTTEN_ITEMS,
  goToPhoneNumberVerificationForm,
  goToSecurityQuestionForm
} from '@login/login/actions'
import { authApi } from '@login/utils/authApi'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { SubPage } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'
import { Title } from './commons'
import { messages } from './resetCredentialsForm'

const Actions = styled.div`
  padding: 32px 0;
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps
  extends RouteComponentProps<
    {},
    {},
    { forgottenItem: FORGOTTEN_ITEMS; nonce: string }
  > {
  goToPhoneNumberVerificationForm: typeof goToPhoneNumberVerificationForm
  goToSecurityQuestionForm: typeof goToSecurityQuestionForm
}

interface State {
  recoveryCode: string
  touched: boolean
  error: boolean
}

type Props = BaseProps & WrappedComponentProps

class RecoveryCodeEntryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      recoveryCode: '',
      touched: false,
      error: true
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: value.length !== 6,
      recoveryCode: value,
      touched: true
    })
  }

  handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (this.state.error) {
      return
    }
    try {
      const { nonce, securityQuestionKey } = await authApi.verifyNumber(
        this.props.location.state.nonce,
        this.state.recoveryCode
      )
      this.props.goToSecurityQuestionForm(
        nonce,
        securityQuestionKey,
        this.props.location.state.forgottenItem
      )
    } catch (error) {
      // @todo error handling
    }
  }

  render() {
    const { intl, goToPhoneNumberVerificationForm } = this.props
    const { forgottenItem } = this.props.location.state

    return (
      <>
        <SubPage
          title={intl.formatMessage(messages.credentialsResetFormTitle, {
            forgottenItem
          })}
          emptyTitle={intl.formatMessage(messages.credentialsResetFormTitle, {
            forgottenItem
          })}
          goBack={() => goToPhoneNumberVerificationForm(forgottenItem)}
        >
          <form onSubmit={this.handleContinue}>
            <Title>
              {intl.formatMessage(messages.recoveryCodeEntryFormBodyHeader)}
            </Title>
            {intl.formatMessage(messages.recoveryCodeEntryFormBodySubheader)}

            <Actions id="recovery-code-verification">
              <InputField
                id="recovery-code"
                key="recoveryCodeFieldContainer"
                label={this.props.intl.formatMessage(
                  messages.verificationCodeFieldLabel
                )}
                touched={this.state.touched}
                error={
                  this.state.error
                    ? this.props.intl.formatMessage(messages.error)
                    : ''
                }
                hideAsterisk={true}
              >
                <TextInput
                  id="recovery-code-input"
                  type="number"
                  key="recoveryCodeInputField"
                  name="recoveryCodeInput"
                  isSmallSized={true}
                  value={this.state.recoveryCode}
                  onChange={e => this.handleChange(e.target.value)}
                  touched={this.state.touched}
                  error={this.state.error}
                />
              </InputField>
            </Actions>

            <PrimaryButton id="continue">
              {intl.formatMessage(messages.continueButtonLabel)}
            </PrimaryButton>
          </form>
        </SubPage>
      </>
    )
  }
}

export const RecoveryCodeEntry = connect(
  null,
  {
    goToPhoneNumberVerificationForm,
    goToSecurityQuestionForm
  }
)(withRouter(injectIntl(RecoveryCodeEntryComponent)))
