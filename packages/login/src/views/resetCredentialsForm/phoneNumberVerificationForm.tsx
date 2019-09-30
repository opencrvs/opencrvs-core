import { goBack, goToRecoveryCodeEntryForm } from '@login/login/actions'
import { phoneNumberFormat } from '@login/utils/validate'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { SubPage } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Title } from './commons'
import { messages } from './resetCredentialsForm'
import { authApi } from '@login/utils/authApi'
import { convertToMSISDN } from '@login/utils/dataCleanse'

const Actions = styled.div`
  padding: 32px 0;
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps {
  goBack: typeof goBack
  goToRecoveryCodeEntryForm: typeof goToRecoveryCodeEntryForm
}
interface State {
  phone: string
  touched: boolean
  error: boolean
}

type Props = BaseProps & WrappedComponentProps

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

  handleContinue = async () => {
    if (!this.state.phone) {
      this.setState({ error: true })
      return
    }
    try {
      const { nonce } = await authApi.verifyUser(
        convertToMSISDN(this.state.phone, window.config.COUNTRY)
      )
      this.props.goToRecoveryCodeEntryForm(nonce)
    } catch (err) {
      // @todo this needs a better error handling
      this.setState({ error: true })
    }
  }

  render() {
    const { intl, goBack } = this.props
    const error = this.state.error && phoneNumberFormat(this.state.phone)

    return (
      <>
        <SubPage
          title={intl.formatMessage(messages.passwordResetFormTitle)}
          emptyTitle={intl.formatMessage(messages.passwordResetFormTitle)}
          goBack={goBack}
        >
          <Title>
            {intl.formatMessage(
              messages.passwordResetPhoneNumberConfirmationFormBodyHeader
            )}
          </Title>
          {intl.formatMessage(
            messages.passwordResetPhoneNumberConfirmationFormBodySubheader
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

          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(messages.continueButtonLabel)}
          </PrimaryButton>
        </SubPage>
      </>
    )
  }
}

export const PhoneNumberVerification = connect(
  null,
  {
    goBack,
    goToRecoveryCodeEntryForm
  }
)(injectIntl(PhoneNumberVerificationComponent))
