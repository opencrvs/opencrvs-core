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
import { SettingsPage } from '@client/views/Settings/SettingsPage'
import { PerformanceHome } from '@client/views/SysAdmin/Performance/PerformanceHome'
import { CompletenessRates } from '@client/views/SysAdmin/Performance/CompletenessRates'
import { WorkflowStatus } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { TeamSearch } from '@client/views/SysAdmin/Team/TeamSearch'

import { getTheme } from '@opencrvs/components/lib/theme'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ConnectedRouter } from 'connected-react-router'
import { History, Location } from 'history'
import * as React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router'
import { AppStore } from './store'
import { UserList } from './views/SysAdmin/Team/user/UserList'
import { SystemList } from './views/SysAdmin/Config/Systems/Systems'
import VSExport from './views/SysAdmin/Vsexports/VSExport'
import { UserAudit } from './views/UserAudit/UserAudit'
import { RegistrationList } from '@client/views/Performance/RegistrationsList'
import { PerformanceStatistics } from '@client/views/Performance/Statistics'
import { Leaderboards } from '@client/views/Performance/Leaderboards'
import { PerformanceDashboard } from '@client/views/Performance/Dashboard'
import { SystemRoleType } from '@client/utils/gateway'
import { AdministrativeLevels } from '@client/views/Organisation/AdministrativeLevels'

import { ApolloProvider } from '@client/utils/ApolloProvider'
import { Home } from '@client/views/OfficeHome/Home'
import AllUserEmail from './views/SysAdmin/Communications/AllUserEmail/AllUserEmail'
import { ReloadModal } from './views/Modals/ReloadModal'

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
                          <ReloadModal />
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
                                              path={routes.ALL_USER_EMAIL}
                                              component={AllUserEmail}
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
