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
import { getTheme } from '@opencrvs/components/lib/theme'
import ApolloClient from 'apollo-client'
import { History, Location } from 'history'
import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'react-redux'
import { Switch } from 'react-router'
import styled, {
  ThemeProvider,
  createGlobalStyle
} from '@client/styledComponents'
import { I18nContainer } from '@client/i18n/components/I18nContainer'
import { AppStore } from '@client/store'
import { ProtectedRoute } from '@client/components/ProtectedRoute'
import * as routes from '@client/navigation/routes'
import { NotificationComponent } from '@client/components/Notification'
import { Page } from '@client/components/Page'
import { ProtectedPage } from '@client/components/ProtectedPage'
import { SelectVitalEvent } from '@client/views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from '@client/views/SelectInformant/SelectInformant'
import { ApplicationForm } from '@client/views/RegisterForm/ApplicationForm'
import { ReviewForm } from '@client/views/RegisterForm/ReviewForm'
import { SearchResult } from '@client/views/SearchResult/SearchResult'
import ScrollToTop from '@client/components/ScrollToTop'
import { createClient } from '@client/utils/apolloClient'
import { ReviewDuplicates } from '@client/views/Duplicates/ReviewDuplicates'
import { SessionExpireConfirmation } from '@client/components/SessionExpireConfirmation'
import { ErrorBoundary } from '@client/components/ErrorBoundary'
import { Details } from '@client/views/Home/Details'
import { StyledErrorBoundary } from '@client/components/StyledErrorBoundary'
import { RegistrationHome } from '@client/views/RegistrationHome/RegistrationHome'
import { FieldAgentHome } from '@client/views/FieldAgentHome/FieldAgentHome'
import { ConnectedRouter } from 'connected-react-router'
import { SettingsPage } from '@client/views/Settings/SettingsPage'
import { SysAdminHome } from '@client/views/SysAdmin/SysAdminHome'
import { CreateNewUser } from '@client/views/SysAdmin/tabs/user/userCreation/CreateNewUser'
import { SelectPrimaryApplicant } from '@client/views/SelectPrimaryApplicant/SelectPrimaryApplicant'
import { getDefaultLanguage } from '@client/i18n/utils'
import { VerifyCollector } from '@client/views/PrintCertificate/VerifyCollector'
import { CollectorForm } from '@client/views/PrintCertificate/collectorForm/CollectorForm'
import TransitionWrapper from '@client/components/TransitionWrapper'
import { ReviewCertificateAction } from '@client/views/PrintCertificate/ReviewCertificateAction'
import { Payment } from '@client/views/PrintCertificate/Payment'
import { ReportList } from '@client/views/Performance/ReportList'
import { Report } from '@client/views/Performance/Report'

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
              <ThemeProvider theme={getTheme(getDefaultLanguage())}>
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
                                            component={FieldAgentHome}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.FIELD_AGENT_HOME_TAB}
                                            component={FieldAgentHome}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SELECT_VITAL_EVENT}
                                            component={SelectVitalEvent}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={
                                              routes.SELECT_BIRTH_PRIMARY_APPLICANT
                                            }
                                            component={SelectPrimaryApplicant}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SELECT_BIRTH_INFORMANT}
                                            component={SelectInformant}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SELECT_DEATH_INFORMANT}
                                            component={SelectInformant}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={
                                              routes.DRAFT_BIRTH_PARENT_FORM
                                            }
                                            component={ApplicationForm}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={
                                              routes.DRAFT_BIRTH_PARENT_FORM_PAGE
                                            }
                                            component={ApplicationForm}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={
                                              routes.DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP
                                            }
                                            component={ApplicationForm}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.DRAFT_DEATH_FORM}
                                            component={ApplicationForm}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.DRAFT_DEATH_FORM_PAGE}
                                            component={ApplicationForm}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={
                                              routes.DRAFT_DEATH_FORM_PAGE_GROUP
                                            }
                                            component={ApplicationForm}
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
                                            component={RegistrationHome}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.REGISTRAR_HOME_TAB}
                                            component={RegistrationHome}
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
                                            path={routes.REVIEW_DUPLICATES}
                                            component={ReviewDuplicates}
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
                                            path={routes.SETTINGS}
                                            component={SettingsPage}
                                          />
                                          <ProtectedRoute
                                            path={routes.APPLICATION_DETAIL}
                                            component={Details}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SYS_ADMIN_HOME}
                                            component={SysAdminHome}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.SYS_ADMIN_HOME_TAB}
                                            component={SysAdminHome}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.CREATE_USER}
                                            component={CreateNewUser}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.CREATE_USER_SECTION}
                                            component={CreateNewUser}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={
                                              routes.PERFORMANCE_REPORT_LIST
                                            }
                                            component={ReportList}
                                          />
                                          <ProtectedRoute
                                            exact
                                            path={routes.PERFORMANCE_REPORT}
                                            component={Report}
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
