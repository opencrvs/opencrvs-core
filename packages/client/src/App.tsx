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
import { NotificationComponent } from '@client/components/Notification'
import { Page } from '@client/components/Page'
import { ProtectedPage } from '@client/components/ProtectedPage'
import { ProtectedRoute } from '@client/components/ProtectedRoute'
import ScrollToTop from '@client/components/ScrollToTop'
import { SessionExpireConfirmation } from '@client/components/SessionExpireConfirmation'
import { StyledErrorBoundary } from '@client/components/StyledErrorBoundary'
import TransitionWrapper from '@client/components/TransitionWrapper'
import { I18nContainer } from '@client/i18n/components/I18nContainer'
import * as routes from '@client/navigation/routes'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import { useApolloClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { FieldAgentList } from '@client/views/Performance/FieldAgentList'
import { CollectorForm } from '@client/views/PrintCertificate/collectorForm/CollectorForm'
import { Payment } from '@client/views/PrintCertificate/Payment'
import { ReviewCertificateAction } from '@client/views/PrintCertificate/ReviewCertificateAction'
import { VerifyCollector } from '@client/views/PrintCertificate/VerifyCollector'
import { DeclarationForm } from '@client/views/RegisterForm/DeclarationForm'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { SearchResult } from '@client/views/SearchResult/SearchResult'
import { SelectVitalEvent } from '@client/views/SelectVitalEvent/SelectVitalEvent'
import { SettingsPage } from '@client/views/Settings/SettingsPage'
import { PerformanceHome } from '@client/views/SysAdmin/Performance/PerformanceHome'
import { CompletenessRates } from '@client/views/SysAdmin/Performance/CompletenessRates'
import { WorkflowStatus } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { TeamSearch } from '@client/views/SysAdmin/Team/TeamSearch'
import { CreateNewUser } from '@client/views/SysAdmin/Team/user/userCreation/CreateNewUser'
import { getTheme } from '@opencrvs/components/lib/theme'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ConnectedRouter } from 'connected-react-router'
import { History, Location } from 'history'
import * as React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router'
import { AppStore } from './store'
import { CorrectionForm, CorrectionReviewForm } from './views/CorrectionForm'
import { VerifyCorrector } from './views/CorrectionForm/VerifyCorrector'
import { RecordAudit } from './views/RecordAudit/RecordAudit'
import { ApplicationConfig } from './views/SysAdmin/Config/Application'
import { CertificatesConfig } from './views/SysAdmin/Config/Certificates'
import { UserList } from './views/SysAdmin/Team/user/UserList'
import { SystemList } from './views/SysAdmin/Config/Systems/Systems'
import VSExport from './views/SysAdmin/Vsexports/VSExport'
import { AdvancedSearchConfig } from './views/SearchResult/AdvancedSearch'
import { ViewRecord } from '@client/views/ViewRecord/ViewRecord'
import { UserAudit } from './views/UserAudit/UserAudit'
import { AdvancedSearchResult } from '@client/views/AdvancedSearch/AdvancedSearchResult'
import { RegistrationList } from '@client/views/Performance/RegistrationsList'
import { PerformanceStatistics } from '@client/views/Performance/Statistics'
import { Leaderboards } from '@client/views/Performance/Leaderboards'
import { PerformanceDashboard } from '@client/views/Performance/Dashboard'
import { SystemRoleType } from '@client/utils/gateway'
import { AdministrativeLevels } from '@client/views/Organisation/AdministrativeLevels'
import InformantNotification from '@client/views/SysAdmin/InformantSMSNotification/InformantSMSNotification'
import { VerifyCertificatePage } from '@client/views/VerifyCertificate/VerifyCertificatePage'
import { IssueCertificate } from '@client/views/IssueCertificate/IssueCertificate'
import { IssuePayment } from '@client/views/IssueCertificate/IssueCollectorForm/IssuePayment'
import UserRoles from '@client/views/SysAdmin/Config/UserRoles/UserRoles'
import { OIDPVerificationCallback } from './views/OIDPVerificationCallback/OIDPVerificationCallback'
import { ApolloProvider } from '@client/utils/ApolloProvider'
import { Home } from '@client/views/OfficeHome/Home'
import { PrintRecord } from './views/PrintRecord/PrintRecord'
import { ReviewCorrection } from './views/ReviewCorrection/ReviewCorrection'

interface IAppProps {
  client?: ApolloClient<NormalizedCacheObject>
  store: AppStore
  history: History
}

const MainSection = styled.section`
  flex-grow: 8;
  background: ${({ theme }) => theme.colors.background};
`

// Injecting global styles for the body tag - used only once
// eslint-disable-line
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow-y: scroll;
  }
`

export function App(props: IAppProps) {
  const { client } = useApolloClient(props.store)
  return (
    <ErrorBoundary>
      <GlobalStyle />
      <ApolloProvider client={props.client || client}>
        <Provider store={props.store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme()}>
              <StyledErrorBoundary>
                <ConnectedRouter history={props.history}>
                  <ScrollToTop>
                    <SessionExpireConfirmation />
                    <NotificationComponent>
                      <Switch>
                        <Route>
                          <Page>
                            <MainSection>
                              <ProtectedPage
                                unprotectedRouteElements={[
                                  'documents',
                                  'affidavit'
                                ]}
                              >
                                <ProtectedRoute
                                  render={({
                                    location
                                  }: {
                                    location: Location
                                  }) => {
                                    return (
                                      <>
                                        <TransitionWrapper location={location}>
                                          <Switch location={location}>
                                            <ProtectedRoute
                                              exact
                                              path={routes.HOME}
                                              component={Home}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.SELECT_VITAL_EVENT}
                                              component={SelectVitalEvent}
                                            />

                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.SELECT_DEATH_INFORMANT
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.SELECT_MARRIAGE_INFORMANT
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_BIRTH_PARENT_FORM
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.VIEW_VERIFY_CERTIFICATE
                                              }
                                              component={VerifyCertificatePage}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_BIRTH_PARENT_FORM_PAGE
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.DRAFT_DEATH_FORM}
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_DEATH_FORM_PAGE
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.DRAFT_MARRIAGE_FORM}
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_DEATH_FORM_PAGE_GROUP
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_MARRIAGE_FORM_PAGE
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.DRAFT_MARRIAGE_FORM_PAGE_GROUP
                                              }
                                              component={DeclarationForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.REVIEW_EVENT_PARENT_FORM_PAGE
                                              }
                                              component={ReviewForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.REVIEW_EVENT_PARENT_FORM_PAGE_GROUP
                                              }
                                              component={ReviewForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.REVIEW_CORRECTION}
                                              component={ReviewCorrection}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.REGISTRAR_HOME}
                                              component={OfficeHome}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.REGISTRAR_HOME_TAB}
                                              component={OfficeHome}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.REGISTRAR_HOME_TAB_PAGE
                                              }
                                              component={OfficeHome}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.NationalSystemAdmin
                                              ]}
                                              path={routes.CERTIFICATE_CONFIG}
                                              component={CertificatesConfig}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.NationalSystemAdmin
                                              ]}
                                              path={
                                                routes.INFORMANT_NOTIFICATION
                                              }
                                              component={InformantNotification}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.LocalRegistrar,
                                                SystemRoleType.RegistrationAgent,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={routes.ADVANCED_SEARCH}
                                              component={AdvancedSearchConfig}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.LocalRegistrar,
                                                SystemRoleType.RegistrationAgent,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={
                                                routes.ADVANCED_SEARCH_RESULT
                                              }
                                              component={AdvancedSearchResult}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.NationalSystemAdmin
                                              ]}
                                              path={routes.APPLICATION_CONFIG}
                                              component={ApplicationConfig}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.NationalSystemAdmin
                                              ]}
                                              path={routes.USER_ROLES_CONFIG}
                                              component={UserRoles}
                                            />
                                            <ProtectedRoute
                                              path={
                                                routes.DECLARATION_RECORD_AUDIT
                                              }
                                              component={RecordAudit}
                                            />
                                            <ProtectedRoute
                                              path={routes.SEARCH}
                                              component={SearchResult}
                                            />
                                            <ProtectedRoute
                                              path={routes.SEARCH_RESULT}
                                              component={SearchResult}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.CERTIFICATE_COLLECTOR
                                              }
                                              component={CollectorForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.VERIFY_COLLECTOR}
                                              component={VerifyCollector}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.VERIFY_CORRECTOR}
                                              component={VerifyCorrector}
                                            />
                                            <ProtectedRoute
                                              path={routes.REVIEW_CERTIFICATE}
                                              component={
                                                ReviewCertificateAction
                                              }
                                            />
                                            <ProtectedRoute
                                              path={
                                                routes.PRINT_CERTIFICATE_PAYMENT
                                              }
                                              component={Payment}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.CERTIFICATE_CORRECTION
                                              }
                                              component={CorrectionForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.CERTIFICATE_CORRECTION_REVIEW
                                              }
                                              component={CorrectionReviewForm}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.SETTINGS}
                                              component={SettingsPage}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.RegistrationAgent,
                                                SystemRoleType.LocalRegistrar,
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement
                                              ]}
                                              path={routes.TEAM_SEARCH}
                                              component={TeamSearch}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.RegistrationAgent,
                                                SystemRoleType.LocalRegistrar,
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalRegistrar,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement
                                              ]}
                                              path={routes.TEAM_USER_LIST}
                                              component={UserList}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.NationalSystemAdmin
                                              ]}
                                              path={routes.SYSTEM_LIST}
                                              component={SystemList}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.CREATE_USER}
                                              component={CreateNewUser}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.CREATE_USER_ON_LOCATION
                                              }
                                              component={CreateNewUser}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.CREATE_USER_SECTION}
                                              component={CreateNewUser}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.REVIEW_USER_FORM}
                                              component={CreateNewUser}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.REVIEW_USER_DETAILS}
                                              component={CreateNewUser}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.RegistrationAgent,
                                                SystemRoleType.LocalRegistrar,
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={routes.PERFORMANCE_HOME}
                                              component={PerformanceHome}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={
                                                routes.PERFORMANCE_STATISTICS
                                              }
                                              component={PerformanceStatistics}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={
                                                routes.PERFORMANCE_LEADER_BOARDS
                                              }
                                              component={Leaderboards}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={
                                                routes.PERFORMANCE_DASHBOARD
                                              }
                                              component={PerformanceDashboard}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={routes.VS_EXPORTS}
                                              component={VSExport}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.EVENT_COMPLETENESS_RATES
                                              }
                                              component={CompletenessRates}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.WORKFLOW_STATUS}
                                              component={WorkflowStatus}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.PERFORMANCE_FIELD_AGENT_LIST
                                              }
                                              component={FieldAgentList}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.USER_PROFILE}
                                              component={UserAudit}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.VIEW_RECORD}
                                              component={ViewRecord}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.PERFORMANCE_REGISTRATIONS_LIST
                                              }
                                              component={RegistrationList}
                                            />
                                            <ProtectedRoute
                                              exact
                                              roles={[
                                                SystemRoleType.RegistrationAgent,
                                                SystemRoleType.LocalRegistrar,
                                                SystemRoleType.LocalSystemAdmin,
                                                SystemRoleType.NationalSystemAdmin,
                                                SystemRoleType.PerformanceManagement,
                                                SystemRoleType.NationalRegistrar
                                              ]}
                                              path={routes.ORGANISATIONS_INDEX}
                                              component={AdministrativeLevels}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.ISSUE_COLLECTOR}
                                              component={IssueCertificate}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.ISSUE_VERIFY_COLLECTOR
                                              }
                                              component={VerifyCollector}
                                            />
                                            <ProtectedRoute
                                              path={
                                                routes.ISSUE_CERTIFICATE_PAYMENT
                                              }
                                              component={IssuePayment}
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={
                                                routes.OIDP_VERIFICATION_CALLBACK
                                              }
                                              component={
                                                OIDPVerificationCallback
                                              }
                                            />
                                            <ProtectedRoute
                                              exact
                                              path={routes.PRINT_RECORD}
                                              component={PrintRecord}
                                            />
                                          </Switch>
                                        </TransitionWrapper>
                                      </>
                                    )
                                  }}
                                />
                              </ProtectedPage>
                            </MainSection>
                          </Page>
                        </Route>
                      </Switch>
                    </NotificationComponent>
                  </ScrollToTop>
                </ConnectedRouter>
              </StyledErrorBoundary>
            </ThemeProvider>
          </I18nContainer>
        </Provider>
      </ApolloProvider>
    </ErrorBoundary>
  )
}
