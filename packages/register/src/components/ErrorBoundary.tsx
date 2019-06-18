import * as React from 'react'
import * as Sentry from '@sentry/browser'
import styled from '@register/styledComponents'

const ErrorMessage = styled.h1`
  text-align: center;
`

interface IErrorInfo extends React.ErrorInfo {
  [key: string]: string
}

export class ErrorBoundary extends React.Component {
  state = { error: null }

  componentDidCatch(error: Error, errorInfo: IErrorInfo) {
    this.setState({ error })
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  render() {
    if (this.state.error) {
      if (
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        Sentry.showReportDialog()
      }

      // We could render fallback UI here
      return <ErrorMessage>Something went wrong...</ErrorMessage>
    } else {
      // when there's not an error, render children untouched
      return this.props.children
    }
  }
}
