import * as React from 'react'
import * as Sentry from '@sentry/browser'
import styled from '@register/styledComponents'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { Button } from '@opencrvs/components/lib/buttons'
import { IStoreState } from '@register/store'
import { errorMessages, buttonMessages } from '@register/i18n/messages'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`
const ErrorTitle = styled.h1`
  ${({ theme }) => theme.fonts.h2Style};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 10px;
`
const ErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 5px 0;
`

const GoToHomepage = styled(Button)`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.subtitleStyle};
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 60px;
`

type IFullProps = IntlShapeProps

interface IErrorInfo extends React.ErrorInfo {
  [key: string]: string
}

class StyledErrorBoundaryComponent extends React.Component<IFullProps> {
  state = { error: null, authError: false }

  componentDidCatch(error: Error, errorInfo: IErrorInfo) {
    this.setState({ error, authError: error.message === '401' })

    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  render() {
    const { intl } = this.props
    if (this.state.error) {
      if (
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        Sentry.showReportDialog()
      }

      return (
        <ErrorContainer>
          <ErrorTitle>
            {this.state.authError &&
              intl.formatMessage(errorMessages.errorCodeUnauthorized)}
          </ErrorTitle>
          <ErrorTitle>
            {this.state.authError
              ? intl.formatMessage(errorMessages.errorTitleUnauthorized)
              : intl.formatMessage(errorMessages.errorTitle)}
          </ErrorTitle>
          <ErrorMessage>
            {intl.formatMessage(errorMessages.unknownErrorTitle)}
          </ErrorMessage>
          <ErrorMessage>
            {intl.formatMessage(errorMessages.unknownErrorDescription)}
          </ErrorMessage>
          <GoToHomepage
            id="GoToHomepage"
            onClick={() => (window.location.href = '/')}
          >
            {intl.formatMessage(buttonMessages.goToHomepage)}
          </GoToHomepage>
        </ErrorContainer>
      )
    } else {
      // when there's not an error, render children untouched
      return this.props.children
    }
  }
}

export const StyledErrorBoundary = connect(
  (state: IStoreState) => ({
    language: state.i18n.language
  }),
  {}
)(injectIntl(StyledErrorBoundaryComponent))
