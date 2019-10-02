import {
  FORGOTTEN_ITEMS,
  goToForgottenItemForm,
  goToRecoveryCodeEntryForm,
  goToSecurityQuestionForm
} from '@login/login/actions'
import { authApi } from '@login/utils/authApi'
import { phoneNumberFormat } from '@login/utils/validate'
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

interface BaseProps {
  goToForgottenItemForm: typeof goToForgottenItemForm
  goToRecoveryCodeEntryForm: typeof goToRecoveryCodeEntryForm
  goToSecurityQuestionForm: typeof goToSecurityQuestionForm
}
interface State {
  phone: string
  touched: boolean
  error: boolean
}

type Props = BaseProps &
  RouteComponentProps<{}, {}, { forgottenItem: FORGOTTEN_ITEMS }> &
  WrappedComponentProps

class PhoneNumberVerificationComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      phone: '',
      touched: false,
      error: false
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: phoneNumberFormat(value) ? true : false,
      phone: value,
      touched: true
    })
  }

  handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!this.state.phone || this.state.error) {
      this.setState({ error: true })
      return
    }
    try {
      const { nonce, securityQuestionKey } = await authApi.verifyUser(
        this.state.phone,
        this.props.location.state.forgottenItem
      )
      if (securityQuestionKey) {
        this.props.goToSecurityQuestionForm(
          nonce,
          securityQuestionKey,
          this.props.location.state.forgottenItem
        )
      } else {
        this.props.goToRecoveryCodeEntryForm(
          nonce,
          this.state.phone,
          this.props.location.state.forgottenItem
        )
      }
    } catch (err) {
      console.log(err)

      // @todo this needs a better error handling
      this.setState({ error: true })
    }
  }

  render() {
    const { intl, goToForgottenItemForm } = this.props
    const error = this.state.error && phoneNumberFormat(this.state.phone)

    return (
      <>
        <SubPage
          title={intl.formatMessage(messages.credentialsResetFormTitle, {
            forgottenItem: this.props.location.state.forgottenItem
          })}
          emptyTitle={intl.formatMessage(messages.credentialsResetFormTitle, {
            forgottenItem: this.props.location.state.forgottenItem
          })}
          goBack={goToForgottenItemForm}
        >
          <form onSubmit={this.handleContinue}>
            <Title>
              {intl.formatMessage(
                messages.phoneNumberConfirmationFormBodyHeader
              )}
            </Title>
            {intl.formatMessage(
              messages.phoneNumberConfirmationFormBodySubheader
            )}

            <Actions id="phone-number-verification">
              <InputField
                id="phone-number"
                key="phoneNumberFieldContainer"
                label={this.props.intl.formatMessage(
                  messages.phoneNumberFieldLabel
                )}
                touched={this.state.touched}
                error={
                  error
                    ? this.props.intl.formatMessage(error.message, error.props)
                    : ''
                }
                hideAsterisk={true}
              >
                <TextInput
                  id="phone-number-input"
                  type="tel"
                  key="phoneNumberInputField"
                  name="phoneNumberInput"
                  isSmallSized={true}
                  value={this.state.phone}
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

export const PhoneNumberVerification = connect(
  null,
  {
    goToForgottenItemForm,
    goToRecoveryCodeEntryForm,
    goToSecurityQuestionForm
  }
)(withRouter(injectIntl(PhoneNumberVerificationComponent)))
