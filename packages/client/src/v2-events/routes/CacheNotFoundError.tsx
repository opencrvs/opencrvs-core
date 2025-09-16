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

import React from 'react'
import * as Sentry from '@sentry/react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { PageWrapper } from '@opencrvs/components/lib/PageWrapper'
import { Box } from '@opencrvs/components'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { logout } from '../utils'

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
  text-align: center;
`

const ErrorMessage = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  color: ${({ theme }) => theme.colors.copy};
  margin-bottom: 32px;
  text-align: center;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 80px;
`
const serviceWorkerCacheMessages = {
  header: {
    id: 'serviceWorker.cacheKey.WorkBoxRuntime.error.header',
    description: 'Header shown when WorkBox runtime cache key is missing',
    defaultMessage: '⚠️ Application Cache Error'
  },
  content: {
    id: 'serviceWorker.cacheKey.WorkBoxRuntime.error.content',
    description: 'Content shown when WorkBox runtime cache key is missing',
    defaultMessage:
      'Something went wrong with loading the app. Reload this page, or log out and log back in to continue.'
  },
  logout: {
    id: 'serviceWorker.cacheKey.WorkBoxRuntime.error.button.logout',
    description:
      'Button label for logging out when WorkBox runtime cache key is missing',
    defaultMessage: 'Log out'
  },
  reload: {
    id: 'serviceWorker.cacheKey.WorkBoxRuntime.error.button.reload',
    description:
      'Button label for reload when WorkBox runtime cache key is missing',
    defaultMessage: 'Reload'
  }
}

export const CacheNotFoundError = () => {
  const intl = useIntl()
  return (
    <Sentry.ErrorBoundary
      onError={(err) => {
        // eslint-disable-next-line no-console
        console.log('Sentry.ErrorBoundary: ', err)
      }}
    >
      <PageWrapper>
        <ErrorContainer>
          <ErrorTitle>
            {intl.formatMessage(serviceWorkerCacheMessages.header)}
          </ErrorTitle>
          <ErrorMessage>
            {intl.formatMessage(serviceWorkerCacheMessages.content)}
          </ErrorMessage>
          <ButtonContainer>
            <TertiaryButton onClick={() => window.location.reload()}>
              {intl.formatMessage(serviceWorkerCacheMessages.reload)}
            </TertiaryButton>
            <TertiaryButton onClick={logout}>
              {intl.formatMessage(serviceWorkerCacheMessages.logout)}
            </TertiaryButton>
          </ButtonContainer>
        </ErrorContainer>
      </PageWrapper>
    </Sentry.ErrorBoundary>
  )
}
