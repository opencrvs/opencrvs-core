/* eslint-disable react/destructuring-assignment */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React, { Component } from 'react'
import * as Sentry from '@sentry/react'
import styled from 'styled-components'
import { TRPCClientError } from '@trpc/client'
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { PageWrapper } from '@opencrvs/components/lib/PageWrapper'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Box } from '@opencrvs/components/lib/Box'
import { errorMessages, buttonMessages } from '@client/i18n/messages'
// eslint-disable-next-line no-restricted-imports
import { redirectToAuthentication } from '@client/profile/profileActions'

const ErrorContainer = styled(Box)`
  display: flex;
  width: 400px;
  flex-direction: column;
  align-items: center;
  margin-top: -80px;
`
const ErrorTitle = styled.h1`
  ${({ theme }) => theme.fonts.h1};
  color: ${({ theme }) => theme.colors.copy};
  margin-bottom: 16px;
`

const ErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.copy};
  margin-bottom: 32px;
  text-align: center;
`

const development = ['127.0.0.1', 'localhost'].includes(
  window.location.hostname
)

interface Props extends IntlShapeProps {
  children: React.ReactNode
  redirectToAuthentication: typeof redirectToAuthentication
}

interface State {
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('TRPC Error Caught:', error)
  }

  render() {
    // eslint-disable-next-line no-shadow
    const { intl, redirectToAuthentication } = this.props
    if (this.state.error) {
      const error = this.state.error
      let httpCode = 500
      let message = error.message

      if (error instanceof TRPCClientError) {
        if (
          error.meta &&
          typeof error.meta === 'object' &&
          'response' in error.meta &&
          error.meta.response &&
          typeof error.meta.response === 'object' &&
          'status' in error.meta.response &&
          'statusText' in error.meta.response
        ) {
          httpCode = Number(error.meta.response.status)
          message = String(error.meta.response.statusText)
        }
      }
      /**
       * TODO: Improve the error message design once the probable errors are defined
       * and the design/ux is ready.
       */
      return (
        <Sentry.ErrorBoundary
          showDialog={!development}
          onError={(err) => {
            // eslint-disable-next-line no-console
            console.log('Sentry.ErrorBoundary: ', err)
          }}
        >
          <PageWrapper>
            <ErrorContainer>
              {httpCode === 401 ? (
                <>
                  <ErrorTitle>
                    {intl.formatMessage(errorMessages.errorTitleUnauthorized)}
                  </ErrorTitle>
                  <ErrorMessage>
                    {intl.formatMessage(errorMessages.errorCodeUnauthorized)}
                  </ErrorMessage>
                  <TertiaryButton
                    id="GoToLoginPage"
                    onClick={() => redirectToAuthentication(true)}
                  >
                    {intl.formatMessage(buttonMessages.login)}
                  </TertiaryButton>
                </>
              ) : (
                <>
                  <ErrorTitle>
                    {intl.formatMessage(errorMessages.errorTitle)}
                  </ErrorTitle>
                  <ErrorMessage>{message}</ErrorMessage>
                  <TertiaryButton
                    id="GoToHomepage"
                    onClick={() => (window.location.href = '/')}
                  >
                    {intl.formatMessage(buttonMessages.goToHomepage)}
                  </TertiaryButton>
                </>
              )}
            </ErrorContainer>
          </PageWrapper>
        </Sentry.ErrorBoundary>
      )
    }

    return this.props.children
  }
}

export const TRPCErrorBoundary = connect(null, { redirectToAuthentication })(
  injectIntl(ErrorBoundary)
)
