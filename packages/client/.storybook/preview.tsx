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
import { Provider, useSelector } from 'react-redux'
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
import {
  addUserToQueryData,
  setEventData,
  addLocalEventConfig,
  setDraftData
} from '@client/v2-events/features/events/useEvents/api'
import {
  Draft,
  EventDocument,
  tennisClubMembershipEvent,
  TestUserRole,
  TokenUserType,
  UUID
} from '@opencrvs/commons/client'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventWithCorrectionRequest
} from '@client/v2-events/features/events/fixtures'
import { EventConfig } from '@opencrvs/commons/client'
import { getUserDetails } from '@client/profile/profileSelectors'

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

type WrapperProps = PropsWithChildren<{
  store: ReturnType<typeof createStore>['store']
  initialPath: string
  router?: RouteObject
}>

function WaitForUserDetails({ children }: PropsWithChildren<{}>) {
  const currentUser = useSelector(getUserDetails)

  if (!currentUser) {
    return null
  }
  return children
}

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
                            <WaitForUserDetails>
                              <Outlet />
                            </WaitForUserDetails>
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
  mockingDate: new Date(2025, 7, 12),
  msw: {
    handlers
  },
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px'
        }
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px'
        }
      }
    },
    defaultViewport: 'responsive'
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
    (options) => {
      const mockingDate = options.parameters?.mockingDate
      if (mockingDate) {
        const OriginalDate = Date
        global.Date = class extends OriginalDate {
          constructor(...args: Parameters<typeof OriginalDate>) {
            if (args.length === 0) {
              super(mockingDate)
            } else {
              super(...args)
            }
          }

          static now() {
            return mockingDate.getTime()
          }
        } as DateConstructor
      }
    },
    async (options) => {
      await clearStorage()
      queryClient.clear()
      const primaryOfficeId = '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID

      if (options.parameters.userRole === TestUserRole.enum.FIELD_AGENT) {
        window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
        addUserToQueryData(generator.user.fieldAgent().v2)
      } else if (
        options.parameters.userRole === TestUserRole.enum.REGISTRATION_AGENT
      ) {
        window.localStorage.setItem(
          'opencrvs',
          generator.user.token.registrationAgent
        )

        addUserToQueryData(generator.user.registrationAgent().v2)
      } else if (
        options.parameters.userRole === TestUserRole.enum.LOCAL_SYSTEM_ADMIN
      ) {
        window.localStorage.setItem(
          'opencrvs',
          generator.user.token.localSystemAdmin
        )

        addUserToQueryData({
          id: generator.user.id.localSystemAdmin,
          name: [{ use: 'en', given: ['Alex'], family: 'Ngonga' }],
          role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
          primaryOfficeId,
          type: TokenUserType.enum.user
        })
      } else if (
        options.parameters.userRole === TestUserRole.enum.NATIONAL_SYSTEM_ADMIN
      ) {
        window.localStorage.setItem(
          'opencrvs',
          generator.user.token.nationalSystemAdmin
        )

        addUserToQueryData(generator.user.nationalSystemAdmin().v2)
      } else {
        window.localStorage.setItem(
          'opencrvs',
          generator.user.token.localRegistrar
        )

        addUserToQueryData(generator.user.localRegistrar().v2)
      }

      /*
       * OFFLINE DATA INITIALISATION
       * Ensure the default record is "downloaded offline" in the user's browser
       * and that users cache has the user. This creates a situation identical to
       * when the user has assigned & downloaded a record
       *
       * If configs are not set explicitly, the default tennis club membership event
       * If events are not set explicitly, the default tennis club membership event document
       *
       */

      const offlineConfigs: Array<EventConfig> = options.parameters?.offline
        ?.configs ?? [tennisClubMembershipEvent]

      offlineConfigs.forEach((config) => {
        addLocalEventConfig(config)
      })

      const offlineEvents: Array<EventDocument> = options.parameters?.offline
        ?.events ?? [
        tennisClubMembershipEventDocument,
        tennisClubMembershipEventWithCorrectionRequest
      ]

      offlineEvents.forEach((event) => {
        setEventData(event.id, event)
      })

      if (options.parameters?.offline?.drafts) {
        const offlineDrafts: Array<Draft> = options.parameters.offline.drafts
        setDraftData(() => offlineDrafts)
      }

      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  decorators: [
    (Story, context) => {
      const { store } = createStore()

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
