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
import { RouterProvider } from 'react-router-dom'
import { ApolloProvider } from '@client/utils/ApolloProvider'
// eslint-disable-next-line import/no-unassigned-import
import 'focus-visible/dist/focus-visible.js'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { router } from '@client/App'
import { createStore } from '@client/store'
import * as actions from '@client/notification/actions'
import { storage } from '@client/storage'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import { SubmissionController } from '@client/SubmissionController'
import WebFont from 'webfontloader'
import { BrowserTracing } from '@sentry/tracing'
import { APPLICATION_VERSION } from './utils/constants'

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:500', 'Noto+Sans:400']
  }
})

storage.configStorage('OpenCRVS')

const { store } = createStore()

if (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  // setup error reporting using sentry
  if (window.config.SENTRY) {
    Sentry.init({
      release: APPLICATION_VERSION,
      environment: import.meta.env.NODE_ENV,
      integrations: [new BrowserTracing()],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
      dsn: window.config.SENTRY
    })
  }
}

function userReconnectedToast() {
  const action = actions.showUserReconnectedToast()
  store.dispatch(action)
}

window.addEventListener('online', userReconnectedToast)

const container = document.getElementById('root')
const root = createRoot(container!)

// Injecting global styles for the body tag - used only once
// eslint-disable-line
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow-y: scroll;
  }
`

export const Root = () => {
  const { client } = useApolloClient(store)

  return (
    <ErrorBoundary>
      <GlobalStyle />
      <ApolloProvider client={client}>
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

root.render(<Root />)

new SubmissionController(store).start()
