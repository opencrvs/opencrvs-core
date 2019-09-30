import { goBack, goToPhoneNumberVerificationForm } from '@login/login/actions'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { RadioButton, SubPage } from '@opencrvs/components/lib/interface'
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
  goToPhoneNumberVerificationForm: typeof goToPhoneNumberVerificationForm
}
interface State {
  forgottenItem: string
  error: boolean
}

type Props = BaseProps & WrappedComponentProps

class ForgottenItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      forgottenItem: '',
      error: false
    }
  }

  handleContinue = () => {
    if (this.state.forgottenItem === '') {
      this.setState({ error: true })
    } else {
      this.props.goToPhoneNumberVerificationForm()
    }
  }

  render() {
    const { intl, goBack } = this.props
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
        <SubPage
          title={intl.formatMessage(messages.forgottenItemFormTitle)}
          emptyTitle={intl.formatMessage(messages.forgottenItemFormTitle)}
          goBack={goBack}
        >
          <Title>
            {intl.formatMessage(messages.forgottenItemFormBodyHeader)}
          </Title>

          <Actions id="forgotten-item-options">
            {this.state.error && (
              <ErrorText>{intl.formatMessage(messages.error)}</ErrorText>
            )}
            {forgottenItems.map(item => {
              return (
                <RadioButton
                  id={item.id}
                  size="large"
                  key={item.id}
                  name="forgottenItemOptions"
                  label={item.option.label}
                  value={item.option.value}
                  selected={
                    this.state.forgottenItem === item.option.value
                      ? item.option.value
                      : ''
                  }
                  onChange={() =>
                    this.setState({ forgottenItem: item.option.value })
                  }
                />
              )
            })}
          </Actions>

          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(messages.continueButtonLabel)}
          </PrimaryButton>
        </SubPage>
      </>
    )
  }
}

export const ForgottenItem = connect(
  null,
  {
    goBack,
    goToPhoneNumberVerificationForm
  }
)(injectIntl(ForgottenItemComponent))
