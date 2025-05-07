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

import { getTheme } from '@opencrvs/components/lib/theme'
import type { Preview } from '@storybook/react'
import { initialize, mswLoader } from 'msw-storybook-addon'
import React, { PropsWithChildren } from 'react'

import { Page } from '@client/components/Page'
import { I18nContainer } from '@client/i18n/components/I18nContainer'
import { createStore } from '@client/store'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useApolloClient } from '@client/utils/apolloClient'
import { ApolloProvider } from '@client/utils/ApolloProvider'
import { queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { Provider } from 'react-redux'
import {
  createMemoryRouter,
  Outlet,
  RouteObject,
  RouterProvider
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import WebFont from 'webfontloader'
import { handlers } from './default-request-handlers'
import { NavigationHistoryProvider } from '@client/v2-events/components/NavigationStack'
WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:500', 'Noto+Sans:400']
  }
})

// Initialize MSW
initialize({
  quiet: true,
  onUnhandledRequest(req, print) {
    if (
      new URL(req.url).pathname.startsWith('/src/') ||
      new URL(req.url).pathname.startsWith('/@fs') ||
      new URL(req.url).pathname.startsWith('/node_modules') ||
      new URL(req.url).pathname.startsWith('/images')
    ) {
      return
    }

    print.warning()
  }
})

const { store } = createStore()

type WrapperProps = PropsWithChildren<{
  store: ReturnType<typeof createStore>['store']
  initialPath: string
  router?: RouteObject
}>

function Wrapper({ store, router, initialPath, children }: WrapperProps) {
  const { client } = useApolloClient(store)

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={getTheme}>
        <Provider store={store}>
          <I18nContainer>
            <TRPCProvider>
              <RouterProvider
                router={createMemoryRouter(
                  [
                    {
                      path: '/',
                      element: (
                        <Page>
                          <NavigationHistoryProvider>
                            <Outlet />
                          </NavigationHistoryProvider>
                        </Page>
                      ),
                      children: [
                        router || {
                          path: initialPath,
                          element: children
                        }
                      ]
                    }
                  ],
                  {
                    initialEntries: [initialPath]
                  }
                )}
              ></RouterProvider>
            </TRPCProvider>
          </I18nContainer>
        </Provider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export const parameters = {
  layout: 'fullscreen',
  msw: {
    handlers: handlers
  }
}

const generator = testDataGenerator()

/*
 * Clear all indexedDB databases before each story
 */
async function clearStorage() {
  const databases = await window.indexedDB.databases()
  for (const db of databases) {
    window.indexedDB.deleteDatabase(db.name!)
  }
}

clearStorage()

const preview: Preview = {
  loaders: [
    mswLoader,
    async () => {
      await clearStorage()
      queryClient.clear()

      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.localRegistrar
      )
    }
  ],
  decorators: [
    (Story, context) => {
      return (
        <Wrapper
          store={store}
          router={context.parameters?.reactRouter?.router}
          initialPath={context.parameters?.reactRouter?.initialPath || '/'}
        >
          <Story />
        </Wrapper>
      )
    }
  ]
}

export default preview
