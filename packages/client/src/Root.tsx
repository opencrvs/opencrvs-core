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
import { ErrorBoundary } from '@client/components/ErrorBoundary'
import { StyledErrorBoundary } from '@client/components/StyledErrorBoundary'
import { I18nContainer } from '@client/i18n/components/I18nContainer'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { useApolloClient } from '@client/utils/apolloClient'
import { Provider } from 'react-redux'
import { RouterProvider, RouterProviderProps } from 'react-router-dom'
import { ApolloProvider } from '@client/utils/ApolloProvider'

import * as React from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { AppStore } from './store'

// Injecting global styles for the body tag - used only once
// eslint-disable-line
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow-y: scroll;
  }
`

/**
 * Starting from react-router v6, routes need to be renderd 'on-the-side' of the application.
 * This changes the order of how provider components are rendered.
 * Root component is the entry point of the application, and renders all the providers before application components, which are rendered by the RouterProvider.
 */
export const Root = ({
  client,
  store,
  router
}: {
  store: AppStore
  router: RouterProviderProps['router']
  client?: ApolloClient<NormalizedCacheObject>
}) => {
  const { client: apolloClient } = useApolloClient(store)

  return (
    <ErrorBoundary>
      <GlobalStyle />
      <ApolloProvider client={client ?? apolloClient}>
        <Provider store={store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme()}>
              <StyledErrorBoundary>
                <RouterProvider router={router} />
              </StyledErrorBoundary>
            </ThemeProvider>
          </I18nContainer>
        </Provider>
      </ApolloProvider>
    </ErrorBoundary>
  )
}
