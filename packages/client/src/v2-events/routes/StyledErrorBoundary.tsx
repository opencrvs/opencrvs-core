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
import { PageWrapper } from '@opencrvs/components/lib/PageWrapper'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Box } from '@opencrvs/components/lib/Box'
import { errorMessages, buttonMessages } from '@client/i18n/messages'

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
`

const development = ['127.0.0.1', 'localhost'].includes(
  window.location.hostname
)

interface Props {
  children: React.ReactNode
}
interface State {
  error: Error | null
}

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class TRPCErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('TRPC Error Caught:', error)
  }

  render() {
    const intl = { formatMessage: (message: any) => message.defaultMessage }
    if (this.state.error) {
      const error = this.state.error
      let httpCode = 500
      let message = 'Something went wrong.'

      console.log(error, 'error')
      if (error instanceof TRPCClientError) {
        console.log('error.data', error.data)
        httpCode = error.data?.httpStatus ?? 500
        message = error.message
      }

      return (
        <Sentry.ErrorBoundary
          showDialog={!development}
          onError={(error) => {
            console.log(error)
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
                </>
              ) : (
                <>
                  <ErrorTitle>
                    {intl.formatMessage(errorMessages.errorTitle)}
                  </ErrorTitle>
                  <ErrorMessage>
                    {intl.formatMessage(errorMessages.unknownErrorDescription)}
                  </ErrorMessage>
                </>
              )}
              <TertiaryButton
                id="GoToHomepage"
                onClick={() => (window.location.href = '/')}
              >
                {intl.formatMessage(buttonMessages.goToHomepage)}
              </TertiaryButton>
            </ErrorContainer>
          </PageWrapper>
        </Sentry.ErrorBoundary>
      )
    }

    return this.props.children
  }
}
