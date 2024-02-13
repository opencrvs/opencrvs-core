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
import * as React from 'react'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import styled from 'styled-components'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
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

type IFullProps = React.PropsWithChildren<IntlShapeProps>

const development = ['127.0.0.1', 'localhost'].includes(
  window.location.hostname
)

class StyledErrorBoundaryComponent extends React.Component<IFullProps> {
  state = { error: null, authError: false }

  onError = (error: Error) => {
    this.setState({ error, authError: error.message === '401' })
  }

  render() {
    const { intl } = this.props

    return (
      <Sentry.ErrorBoundary
        showDialog={!development}
        onError={this.onError}
        fallback={
          <PageWrapper>
            <ErrorContainer>
              <ErrorTitle>
                {this.state.authError &&
                  intl.formatMessage(errorMessages.errorCodeUnauthorized)}
                {this.state.authError
                  ? intl.formatMessage(errorMessages.errorTitleUnauthorized)
                  : intl.formatMessage(errorMessages.errorTitle)}
              </ErrorTitle>
              <ErrorMessage>
                {intl.formatMessage(errorMessages.unknownErrorDescription)}
              </ErrorMessage>
              <TertiaryButton
                id="GoToHomepage"
                onClick={() => (window.location.href = '/')}
              >
                {intl.formatMessage(buttonMessages.goToHomepage)}
              </TertiaryButton>
            </ErrorContainer>
          </PageWrapper>
        }
      >
        {this.props.children}
      </Sentry.ErrorBoundary>
    )
  }
}

export const StyledErrorBoundary = injectIntl(StyledErrorBoundaryComponent)
