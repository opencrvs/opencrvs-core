/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import styled from '@client/styledComponents'

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
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
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
