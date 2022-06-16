/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
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
import styled, {
  createGlobalStyle,
  ThemeProvider
} from '@client/styledComponents'
import { createClient } from '@client/utils/apolloClient'
import { EventInfo } from '@client/views/EventInfo/EventInfo'
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
import { UserProfile } from '@client/views/SysAdmin/Team/user/userProfilie/UserProfile'
import { getTheme } from '@opencrvs/components/lib/theme'
import ApolloClient from 'apollo-client'
import { ConnectedRouter } from 'connected-react-router'
import { History, Location } from 'history'
import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'react-redux'
import { Switch } from 'react-router'
import { AppStore } from './store'
import { CorrectionForm, CorrectionReviewForm } from './views/CorrectionForm'
import { VerifyCorrector } from './views/CorrectionForm/VerifyCorrector'
import { RecordAudit } from './views/RecordAudit/RecordAudit'
import { ChangePhonePage } from './views/Settings/ChangePhonePage'
import { ApplicationConfig } from './views/SysAdmin/Config/Application'
import { CertificatesConfig } from './views/SysAdmin/Config/Certificates'
import { UserList } from './views/SysAdmin/Team/user/UserList'
import { FormConfigHome, FormConfigWizard } from './views/SysAdmin/Config/Forms'
import { Roles } from '@client/utils/authUtils'

interface IAppProps {
  client?: ApolloClient<{}>
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

export class App extends React.Component<IAppProps> {
  public render() {
    return (
      <ErrorBoundary>
        <GlobalStyle />
        <ApolloProvider
          client={this.props.client || createClient(this.props.store)}
        >
          <Provider store={this.props.store}>
            <I18nContainer>
              <ThemeProvider theme={getTheme()}>
                <StyledErrorBoundary>
                  <ConnectedRouter history={this.props.history}>
                    <ScrollToTop>
                      <SessionExpireConfirmation />
                      <NotificationComponent>
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
                                            component={OfficeHome}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SELECT_VITAL_EVENT}
                                            component={SelectVitalEvent}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.EVENT_INFO}
                                            component={EventInfo}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SELECT_BIRTH_INFORMANT}
                                            component={DeclarationForm}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SELECT_DEATH_INFORMANT}
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
                                            path={routes.DRAFT_DEATH_FORM_PAGE}
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
                                            roles={[
                                              Roles.NATIONAL_SYSTEM_ADMIN
                                            ]}
                                            path={routes.CERTIFICATE_CONFIG}
                                            component={CertificatesConfig}
                                          />
                                          <ProtectedRoute
                                            exact
                                            roles={[
                                              Roles.NATIONAL_SYSTEM_ADMIN
                                            ]}
                                            path={routes.APPLICATION_CONFIG}
                                            component={ApplicationConfig}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.FORM_CONFIG_WIZARD}
                                            component={FormConfigWizard}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.FORM_CONFIG_HOME}
                                            component={FormConfigHome}
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
                                            path={routes.CERTIFICATE_COLLECTOR}
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
                                            component={ReviewCertificateAction}
                                          />
                                          <ProtectedRoute
                                            path={
                                              routes.PRINT_CERTIFICATE_PAYMENT
                                            }
                                            component={Payment}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.CERTIFICATE_CORRECTION}
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
                                            path={routes.CHANGE_PHONE}
                                            component={ChangePhonePage}
                                          />
                                          <ProtectedRoute
                                            exact
                                            roles={[
                                              Roles.REGISTRATION_AGENT,
                                              Roles.LOCAL_REGISTRAR,
                                              Roles.LOCAL_SYSTEM_ADMIN,
                                              Roles.NATIONAL_SYSTEM_ADMIN,
                                              Roles.PERFORMANCE_MANAGEMENT
                                            ]}
                                            path={routes.TEAM_SEARCH}
                                            component={TeamSearch}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.TEAM_USER_LIST}
                                            component={UserList}
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
                                              Roles.REGISTRATION_AGENT,
                                              Roles.LOCAL_REGISTRAR,
                                              Roles.LOCAL_SYSTEM_ADMIN,
                                              Roles.NATIONAL_SYSTEM_ADMIN,
                                              Roles.PERFORMANCE_MANAGEMENT,
                                              Roles.NATIONAL_REGISTRAR
                                            ]}
                                            path={routes.PERFORMANCE_HOME}
                                            component={PerformanceHome}
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
                                            component={UserProfile}
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
}
