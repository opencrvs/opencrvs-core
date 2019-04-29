import * as React from 'react'
import * as Sentry from '@sentry/browser'
import styled from 'styledComponents'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { connect } from 'react-redux'
import { Button } from '@opencrvs/components/lib/buttons'
import { IStoreState } from 'store'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`
const ErrorTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 32px;
  margin: 10px;
`
const ErrorMessage = styled.div`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 24px;
  margin: 5px 0;
`

const GoToHomepage = styled(Button)`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  background: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 60px;
`

const messages = defineMessages({
  errorCodeUnauthorized: {
    id: 'error.code',
    defaultMessage: '401',
    description: 'Error code'
  },
  errorTitleUnauthorized: {
    id: 'error.title.unauthorized',
    defaultMessage: 'Unauthorized!',
    description: 'Error title unauthorized'
  },
  errorTitle: {
    id: 'error.title',
    defaultMessage: 'Whoops!',
    description: 'Error title'
  },
  errorDescription1: {
    id: 'error.description1',
    defaultMessage: 'Something went wrong.',
    description: 'Error description'
  },
  errorDescription2: {
    id: 'error.description2',
    defaultMessage: "It's not you, it us. This is our fault.",
    description: 'Error description'
  },
  goToHomepage: {
    id: 'goto.homepage',
    defaultMessage: 'Go to Homepage',
    description: 'Label for Go to Homepage button'
  }
})

type IFullProps = InjectedIntlProps

class StyledErrorBoundaryComponent extends React.Component<IFullProps> {
  state = { error: null, authError: false }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
              intl.formatMessage(messages.errorCodeUnauthorized)}
          </ErrorTitle>
          <ErrorTitle>
            {this.state.authError
              ? intl.formatMessage(messages.errorTitleUnauthorized)
              : intl.formatMessage(messages.errorTitle)}
          </ErrorTitle>
          <ErrorMessage>
            {intl.formatMessage(messages.errorDescription1)}
          </ErrorMessage>
          <ErrorMessage>
            {intl.formatMessage(messages.errorDescription2)}
          </ErrorMessage>
          <GoToHomepage
            id="GoToHomepage"
            onClick={() => (window.location.href = '/')}
          >
            {intl.formatMessage(messages.goToHomepage)}
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
