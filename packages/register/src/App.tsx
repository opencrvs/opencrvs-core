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
} from '@register/styledComponents'
import { I18nContainer } from '@register/i18n/components/I18nContainer'
import { AppStore } from '@register/store'
import { ProtectedRoute } from '@register/components/ProtectedRoute'
import * as routes from '@register/navigation/routes'
import { NotificationComponent } from '@register/components/Notification'
import { Page } from '@register/components/Page'
import { ProtectedPage } from '@register/components/ProtectedPage'
import { SelectVitalEvent } from '@register/views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from '@register/views/SelectInformant/SelectInformant'
import { ApplicationForm } from '@register/views/RegisterForm/ApplicationForm'
import { ReviewForm } from '@register/views/RegisterForm/ReviewForm'
import { SearchResult } from '@register/views/SearchResult/SearchResult'
import ScrollToTop from '@register/components/ScrollToTop'
import { createClient } from '@register/utils/apolloClient'
import { ReviewDuplicates } from '@register/views/Duplicates/ReviewDuplicates'
import { SessionExpireConfirmation } from '@register/components/SessionExpireConfirmation'
import { ConfirmationScreen } from '@register/views/ConfirmationScreen/ConfirmationScreen'
import { ErrorBoundary } from '@register/components/ErrorBoundary'
import { Details } from '@register/views/Home/Details'
import { StyledErrorBoundary } from '@register/components/StyledErrorBoundary'
import { RegistrationHome } from '@register/views/RegistrationHome/RegistrationHome'
import { FieldAgentHome } from '@register/views/FieldAgentHome/FieldAgentHome'
import { ConnectedRouter } from 'connected-react-router'
import { SettingsPage } from '@register/views/Settings/SettingsPage'
import { SysAdminHome } from '@register/views/SysAdmin/SysAdminHome'
import { CreateNewUser } from '@register/views/SysAdmin/views/CreateNewUser'
import { SelectPrimaryApplicant } from '@register/views/SelectPrimaryApplicant/SelectPrimaryApplicant'
import TransitionWrapper from '@register/components/TransitionWrapper'
import { getDefaultLanguage } from '@register/i18n/utils'
import { VerifyCollector } from '@register/views/PrintCertificate/VerifyCollector'
import { ReviewCertificateAction } from '@register/views/PrintCertificate/ReviewCertificateAction'
import { Payment } from '@register/views/PrintCertificate/Payment'
import { CollectorForm } from '@register/views/PrintCertificate/collectorForm/CollectorForm'

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
                                            path={routes.CONFIRMATION_SCREEN}
                                            component={ConfirmationScreen}
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
