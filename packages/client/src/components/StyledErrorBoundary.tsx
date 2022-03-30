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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { Button } from '@opencrvs/components/lib/buttons'
import { errorMessages, buttonMessages } from '@client/i18n/messages'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`
const ErrorTitle = styled.h1`
  ${({ theme }) => theme.fonts.h1};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 10px;
`
const ErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 5px 0;
`

const GoToHomepage = styled(Button)`
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bold14};
  text-transform: capitalize;
  cursor: pointer;
  margin-top: 60px;
`

type IFullProps = React.PropsWithChildren<IntlShapeProps>

interface IErrorInfo extends React.ErrorInfo {
  [key: string]: string
}

class StyledErrorBoundaryComponent extends React.Component<IFullProps> {
  state = { error: null, authError: false }

  componentDidCatch(error: Error, errorInfo: IErrorInfo) {
    this.setState({ error, authError: error.message === '401' })

    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
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

export const StyledErrorBoundary = injectIntl(StyledErrorBoundaryComponent)
