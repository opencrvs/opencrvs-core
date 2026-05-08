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

import { NotificationComponent } from '@client/components/Notification'
import { Page } from '@client/components/Page'
import { ProtectedPage } from '@client/components/ProtectedPage'
import { ProtectedRoute } from '@client/components/ProtectedRoute'
import ScrollToTop from '@client/components/ScrollToTop'
import { SessionExpireConfirmation } from '@client/components/SessionExpireConfirmation'
import * as routes from '@client/navigation/routes'
import { AdvancedSearchResult } from '@client/views/AdvancedSearch/AdvancedSearchResult'
import { IssueCertificate } from '@client/views/IssueCertificate/IssueCertificate'
import { IssuePayment } from '@client/views/IssueCertificate/IssueCollectorForm/IssuePayment'
import { Home } from '@client/views/OfficeHome/Home'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { AdministrativeLevels } from '@client/views/Organisation/AdministrativeLevels'
import { PerformanceDashboard } from '@client/views/Performance/Dashboard'
import { FieldAgentList } from '@client/views/Performance/FieldAgentList'
import { RegistrationList } from '@client/views/Performance/RegistrationsList'
import { CollectorForm } from '@client/views/PrintCertificate/collectorForm/CollectorForm'
import { Payment } from '@client/views/PrintCertificate/Payment'
import { VerifyCollector } from '@client/views/PrintCertificate/VerifyCollector'
import { DeclarationForm } from '@client/views/RegisterForm/DeclarationForm'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { SearchResult } from '@client/views/SearchResult/SearchResult'
import { SelectVitalEvent } from '@client/views/SelectVitalEvent/SelectVitalEvent'
import { SettingsPage } from '@client/views/Settings/SettingsPage'
import { CompletenessRates } from '@client/views/SysAdmin/Performance/CompletenessRates'
import { PerformanceHome } from '@client/views/SysAdmin/Performance/PerformanceHome'
import { WorkflowStatus } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { TeamSearch } from '@client/views/SysAdmin/Team/TeamSearch'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'
import { VerifyCertificatePage } from '@client/views/VerifyCertificate/VerifyCertificatePage'
import { ViewRecord } from '@client/views/ViewRecord/ViewRecord'
import { SCOPES } from '@opencrvs/commons/client'
import { getTheme } from '@opencrvs/components'
import * as React from 'react'
import { Provider } from 'react-redux'
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider
} from 'react-router-dom'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import { ErrorBoundary } from './components/ErrorBoundary'
import { StyledErrorBoundary } from './components/StyledErrorBoundary'
import { I18nContainer } from './i18n/components/I18nContainer'
import { useApolloClient } from './utils/apolloClient'
import { ApolloProvider } from './utils/ApolloProvider'

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { AppStore } from './store'
import { routesConfig as v2RoutesConfig } from './v2-events/routes/config'

// Injecting global styles for the body tag - used only once
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow-y: scroll;
  }
`

const MainSection = styled.section`
  flex-grow: 8;
  background: ${({ theme }) => theme.colors.background};
`

function createRedirect(from: string, to: string) {
  return {
    path: from,
    loader: () => {
      return redirect(to)
    }
  }
}

export const routesConfig = [
  {
    path: '/',
    element: (
      <ScrollToTop>
        <SessionExpireConfirmation />
        <NotificationComponent>
          <Page>
            <MainSection>
              <ProtectedPage
                unprotectedRouteElements={['documents', 'affidavit']}
              >
                <Outlet />
              </ProtectedPage>
            </MainSection>
          </Page>
        </NotificationComponent>
      </ScrollToTop>
    ),
    children: [
      v2RoutesConfig,
      createRedirect('/v2/*', '/'),
      createRedirect('/registration-home/my-drafts/*', '/'),
      createRedirect('/registration-home/requiresUpdate/*', '/'),
      createRedirect('/registration-home/progress/*', '/'),
      createRedirect('/registration-home/outbox/*', '/'),
      createRedirect('/registration-home/readyToIssue/*', '/'),
      createRedirect('/registration-home/print/*', '/'),
      createRedirect('/registration-home/readyForReview/*', '/'),
      createRedirect('/events', '/events/create')
    ]
  }
]

interface IAppProps {
  client?: ApolloClient<NormalizedCacheObject>
  store: AppStore
  router: ReturnType<typeof createBrowserRouter>
}
export function App({ client, store, router }: IAppProps) {
  const { client: apolloClient } = useApolloClient(store)

  return (
    <ErrorBoundary>
      <GlobalStyle />
      <ApolloProvider client={client ?? apolloClient}>
        <Provider store={store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme()}>
              <StyledErrorBoundary>
                <RouterProvider
                  router={router}
                  // v7_startTransition used to be true for a moment, but it changed the routing and broke some farajaland e2e tests (and possibly changed actual functionality as well).
                  future={{ v7_startTransition: false }}
                />
              </StyledErrorBoundary>
            </ThemeProvider>
          </I18nContainer>
        </Provider>
      </ApolloProvider>
    </ErrorBoundary>
  )
}
