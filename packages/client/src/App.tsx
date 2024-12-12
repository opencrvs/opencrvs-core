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

import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import * as React from 'react'
import { NotificationComponent } from '@client/components/Notification'
import { Page } from '@client/components/Page'
import { ProtectedPage } from '@client/components/ProtectedPage'
import { ProtectedRoute } from '@client/components/ProtectedRoute'
import ScrollToTop from '@client/components/ScrollToTop'
import { SessionExpireConfirmation } from '@client/components/SessionExpireConfirmation'
import * as routes from '@client/navigation/routes'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { FieldAgentList } from '@client/views/Performance/FieldAgentList'
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
import { CorrectionForm, CorrectionReviewForm } from './views/CorrectionForm'
import { VerifyCorrector } from './views/CorrectionForm/VerifyCorrector'
import { ReviewCertificate } from './views/PrintCertificate/ReviewCertificateAction'
import { RecordAudit } from './views/RecordAudit/RecordAudit'
import { UserList } from './views/SysAdmin/Team/user/UserList'
import { SystemList } from './views/SysAdmin/Config/Systems/Systems'
import VSExport from './views/SysAdmin/Vsexports/VSExport'
import { AdvancedSearchConfig } from './views/SearchResult/AdvancedSearch'
import { UserAudit } from './views/UserAudit/UserAudit'
import { AdvancedSearchResult } from '@client/views/AdvancedSearch/AdvancedSearchResult'
import { IssueCertificate } from '@client/views/IssueCertificate/IssueCertificate'
import { IssuePayment } from '@client/views/IssueCertificate/IssueCollectorForm/IssuePayment'
import { Home } from '@client/views/OfficeHome/Home'
import { PrintRecord } from './views/PrintRecord/PrintRecord'
import { ReviewCorrection } from './views/ReviewCorrection/ReviewCorrection'
import AllUserEmail from './views/SysAdmin/Communications/AllUserEmail/AllUserEmail'
import { ReloadModal } from './views/Modals/ReloadModal'
import { AdministrativeLevels } from '@client/views/Organisation/AdministrativeLevels'
import { PerformanceDashboard } from '@client/views/Performance/Dashboard'
import { Leaderboards } from '@client/views/Performance/Leaderboards'
import { RegistrationList } from '@client/views/Performance/RegistrationsList'
import { PerformanceStatistics } from '@client/views/Performance/Statistics'
import { VerifyCertificatePage } from '@client/views/VerifyCertificate/VerifyCertificatePage'
import { ViewRecord } from '@client/views/ViewRecord/ViewRecord'
import { EventFormWizardIndex } from './v2-events/features/events/EventFormWizard'
import { EventSelection } from './v2-events/features/events/EventSelection'
import { Workqueues } from './v2-events/features/workqueues'
import {
  V2_DECLARE_ACTION_REVIEW_ROUTE,
  V2_DECLARE_ACTION_ROUTE,
  V2_DECLARE_ACTION_ROUTE_WITH_PAGE,
  V2_EVENTS_ROUTE,
  V2_ROOT_ROUTE
} from './v2-events/routes'
import { TRPCProvider } from './v2-events/trpc'
import { ReviewSection } from './v2-events/features/events/actions/declare/Review'
import { DeclareIndex } from './v2-events/features/events/actions/declare/Declare'
import { SCOPES } from '@opencrvs/commons/client'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { AppStore } from './store'
import { useApolloClient } from './utils/apolloClient'
import { getTheme } from '@opencrvs/components'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ApolloProvider } from './utils/ApolloProvider'
import { Provider } from 'react-redux'
import { I18nContainer } from './i18n/components/I18nContainer'
import { StyledErrorBoundary } from './components/StyledErrorBoundary'

// Injecting global styles for the body tag - used only once
// eslint-disable-line
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

export const routesConfig = [
  {
    path: '/',
    element: (
      <ScrollToTop>
        <ReloadModal />
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
      { path: routes.HOME, element: <Home /> },
      { path: routes.SELECT_VITAL_EVENT, element: <SelectVitalEvent /> },
      { path: routes.SELECT_DEATH_INFORMANT, element: <DeclarationForm /> },
      { path: routes.SELECT_MARRIAGE_INFORMANT, element: <DeclarationForm /> },
      { path: routes.DRAFT_BIRTH_PARENT_FORM, element: <DeclarationForm /> },
      {
        path: routes.VIEW_VERIFY_CERTIFICATE,
        element: <VerifyCertificatePage />
      },
      {
        path: routes.DRAFT_BIRTH_PARENT_FORM_PAGE,
        element: <DeclarationForm />
      },
      {
        path: routes.DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
        element: <DeclarationForm />
      },
      { path: routes.DRAFT_DEATH_FORM, element: <DeclarationForm /> },
      { path: routes.DRAFT_DEATH_FORM_PAGE, element: <DeclarationForm /> },
      { path: routes.DRAFT_MARRIAGE_FORM, element: <DeclarationForm /> },
      {
        path: routes.DRAFT_DEATH_FORM_PAGE_GROUP,
        element: <DeclarationForm />
      },
      { path: routes.DRAFT_MARRIAGE_FORM_PAGE, element: <DeclarationForm /> },
      {
        path: routes.DRAFT_MARRIAGE_FORM_PAGE_GROUP,
        element: <DeclarationForm />
      },
      { path: routes.REVIEW_EVENT_PARENT_FORM_PAGE, element: <ReviewForm /> },
      {
        path: routes.REVIEW_EVENT_PARENT_FORM_PAGE_GROUP,
        element: <ReviewForm />
      },
      { path: routes.REVIEW_CORRECTION, element: <ReviewCorrection /> },
      { path: routes.REGISTRAR_HOME, element: <OfficeHome /> },
      { path: routes.REGISTRAR_HOME_TAB, element: <OfficeHome /> },
      { path: routes.REGISTRAR_HOME_TAB_PAGE, element: <OfficeHome /> },
      {
        path: routes.ALL_USER_EMAIL,
        element: (
          <ProtectedRoute scopes={[SCOPES.CONFIG_UPDATE_ALL]}>
            <AllUserEmail />
          </ProtectedRoute>
        )
      },
      {
        path: routes.ADVANCED_SEARCH,
        element: (
          <ProtectedRoute
            scopes={[
              SCOPES.SEARCH_BIRTH,
              SCOPES.SEARCH_BIRTH_MY_JURISDICTION,
              SCOPES.SEARCH_DEATH,
              SCOPES.SEARCH_DEATH_MY_JURISDICTION,
              SCOPES.SEARCH_MARRIAGE,
              SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION
            ]}
          >
            <AdvancedSearchConfig />
          </ProtectedRoute>
        )
      },
      {
        path: routes.ADVANCED_SEARCH_RESULT,
        element: (
          <ProtectedRoute
            scopes={[
              SCOPES.SEARCH_BIRTH,
              SCOPES.SEARCH_BIRTH_MY_JURISDICTION,
              SCOPES.SEARCH_DEATH,
              SCOPES.SEARCH_DEATH_MY_JURISDICTION,
              SCOPES.SEARCH_MARRIAGE,
              SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION
            ]}
          >
            <AdvancedSearchResult />
          </ProtectedRoute>
        )
      },
      { path: routes.DECLARATION_RECORD_AUDIT, element: <RecordAudit /> },
      { path: routes.SEARCH, element: <SearchResult /> },
      { path: routes.SEARCH_RESULT, element: <SearchResult /> },
      { path: routes.CERTIFICATE_COLLECTOR, element: <CollectorForm /> },
      { path: routes.VERIFY_COLLECTOR, element: <VerifyCollector /> },
      { path: routes.VERIFY_CORRECTOR, element: <VerifyCorrector /> },
      { path: routes.REVIEW_CERTIFICATE, element: <ReviewCertificate /> },
      { path: routes.PRINT_CERTIFICATE_PAYMENT, element: <Payment /> },
      { path: routes.CERTIFICATE_CORRECTION, element: <CorrectionForm /> },
      {
        path: routes.CERTIFICATE_CORRECTION_REVIEW,
        element: <CorrectionReviewForm />
      },
      { path: routes.SETTINGS, element: <SettingsPage /> },
      {
        path: routes.TEAM_USER_LIST,
        element: (
          <ProtectedRoute
            scopes={[
              SCOPES.ORGANISATION_READ_LOCATIONS,
              SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
              SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
            ]}
          >
            <UserList />
          </ProtectedRoute>
        )
      },
      {
        path: routes.SYSTEM_LIST,
        element: (
          <ProtectedRoute scopes={[SCOPES.CONFIG_UPDATE_ALL]}>
            <SystemList />
          </ProtectedRoute>
        )
      },
      {
        path: routes.VS_EXPORTS,
        element: (
          <ProtectedRoute scopes={[SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS]}>
            <VSExport />
          </ProtectedRoute>
        )
      },
      { path: routes.USER_PROFILE, element: <UserAudit /> },
      { path: routes.VIEW_RECORD, element: <ViewRecord /> },
      {
        path: routes.PERFORMANCE_REGISTRATIONS_LIST,
        element: <RegistrationList />
      },
      {
        path: routes.PERFORMANCE_STATISTICS,
        element: (
          <ProtectedRoute scopes={[SCOPES.PERFORMANCE_READ_DASHBOARDS]}>
            <PerformanceStatistics />
          </ProtectedRoute>
        )
      },
      {
        path: routes.PERFORMANCE_LEADER_BOARDS,
        element: (
          <ProtectedRoute scopes={[SCOPES.PERFORMANCE_READ_DASHBOARDS]}>
            <Leaderboards />
          </ProtectedRoute>
        )
      },
      {
        path: routes.PERFORMANCE_DASHBOARD,
        element: (
          <ProtectedRoute scopes={[SCOPES.PERFORMANCE_READ_DASHBOARDS]}>
            <PerformanceDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: routes.ORGANISATIONS_INDEX,
        element: (
          <ProtectedRoute
            scopes={[
              SCOPES.ORGANISATION_READ_LOCATIONS,
              SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
              SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
            ]}
          >
            <AdministrativeLevels />
          </ProtectedRoute>
        )
      },
      { path: routes.ISSUE_COLLECTOR, element: <IssueCertificate /> },
      { path: routes.ISSUE_VERIFY_COLLECTOR, element: <VerifyCollector /> },
      { path: routes.ISSUE_CERTIFICATE_PAYMENT, element: <IssuePayment /> },
      { path: routes.PRINT_RECORD, element: <PrintRecord /> },
      {
        path: routes.PERFORMANCE_FIELD_AGENT_LIST,
        element: <FieldAgentList />
      },
      {
        path: routes.PERFORMANCE_HOME,
        element: (
          <ProtectedRoute scopes={[SCOPES.PERFORMANCE_READ]}>
            <PerformanceHome />
          </ProtectedRoute>
        )
      },
      {
        path: routes.EVENT_COMPLETENESS_RATES,
        element: <CompletenessRates />
      },
      {
        path: routes.WORKFLOW_STATUS,
        element: <WorkflowStatus />
      },
      {
        path: routes.TEAM_SEARCH,
        element: (
          <ProtectedRoute
            scopes={[
              SCOPES.USER_READ,
              SCOPES.USER_READ_MY_OFFICE,
              SCOPES.USER_READ_MY_JURISDICTION
            ]}
          >
            <TeamSearch />
          </ProtectedRoute>
        )
      },
      {
        path: routes.CREATE_USER,
        element: <CreateNewUser />
      },
      {
        path: routes.CREATE_USER_ON_LOCATION,
        element: <CreateNewUser />
      },
      {
        path: routes.CREATE_USER_SECTION,
        element: <CreateNewUser />
      },
      {
        path: routes.REVIEW_USER_FORM,
        element: <CreateNewUser />
      },
      {
        path: routes.REVIEW_USER_DETAILS,
        element: <CreateNewUser />
      },
      {
        path: V2_ROOT_ROUTE,
        element: (
          <TRPCProvider>
            <Workqueues />
          </TRPCProvider>
        )
      },
      {
        path: V2_EVENTS_ROUTE,
        element: (
          <TRPCProvider>
            <EventSelection />
          </TRPCProvider>
        )
      },
      {
        path: V2_DECLARE_ACTION_ROUTE,
        element: (
          <TRPCProvider>
            <EventFormWizardIndex />
          </TRPCProvider>
        )
      },
      {
        path: V2_DECLARE_ACTION_REVIEW_ROUTE,
        element: (
          <TRPCProvider>
            <ReviewSection />
          </TRPCProvider>
        )
      },
      {
        path: V2_DECLARE_ACTION_ROUTE_WITH_PAGE,
        element: (
          <TRPCProvider>
            <DeclareIndex />
          </TRPCProvider>
        )
      }
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
                <RouterProvider router={router} />
              </StyledErrorBoundary>
            </ThemeProvider>
          </I18nContainer>
        </Provider>
      </ApolloProvider>
    </ErrorBoundary>
  )
}
