import { Footer } from '@opencrvs/components/lib/interface/'
import { getTheme } from '@opencrvs/components/lib/theme'
import ApolloClient from 'apollo-client'
import { History } from 'history'
import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'react-redux'
import { Switch } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import ScrollToTop from 'src/components/ScrollToTop'
import { createClient } from 'src/utils/apolloClient'
import { Details } from 'src/views/Home/Details'
import styled, { ThemeProvider } from 'styled-components'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotificationComponent } from './components/Notification'
import { Page } from './components/Page'
import { ProtectedPage } from './components/ProtectedPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SessionExpireConfirmation } from './components/SessionExpireConfirmation'
import { StyledErrorBoundary } from './components/StyledErrorBoundary'
import { I18nContainer } from './i18n/components/I18nContainer'
import * as routes from './navigation/routes'
import { AppStore, createStore } from './store'
import { ConfirmationScreen } from './views/ConfirmationScreen/ConfirmationScreen'
import { ReviewDuplicates } from './views/Duplicates/ReviewDuplicates'
import { FieldAgentHome } from './views/FieldAgentHome/FieldAgentHome'
import { PrintCertificateAction } from './views/PrintCertificate/PrintCertificateAction'
import { ApplicationForm } from './views/RegisterForm/ApplicationForm'
import { ReviewForm } from './views/RegisterForm/ReviewForm'
import { RegistrarHome } from './views/RegistrarHome/RegistrarHome'
import { SearchResult } from './views/SearchResult/SearchResult'
import { SelectInformant } from './views/SelectInformant/SelectInformant'
import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SettingsPage } from './views/Settings/SettingsPage'

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}
const MainSection = styled.section`
  flex-grow: 8;
  padding-bottom: 48px;
`
export const store = createStore()

export class App extends React.Component<IAppProps> {
  public render() {
    return (
      <ErrorBoundary>
        <ApolloProvider
          client={this.props.client || createClient(this.props.store)}
        >
          <Provider store={this.props.store}>
            <I18nContainer>
              <ThemeProvider
                theme={getTheme(window.config.COUNTRY, window.config.LANGUAGE)}
              >
                <StyledErrorBoundary>
                  <ConnectedRouter history={this.props.history}>
                    <ScrollToTop>
                      <SessionExpireConfirmation />
                      <NotificationComponent>
                        <Page>
                          <MainSection>
                            <ProtectedPage>
                              <Switch>
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
                                  path={routes.SELECT_INFORMANT}
                                  component={SelectInformant}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.DRAFT_BIRTH_PARENT_FORM}
                                  component={ApplicationForm}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.DRAFT_BIRTH_PARENT_FORM_TAB}
                                  component={ApplicationForm}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.DRAFT_DEATH_FORM}
                                  component={ApplicationForm}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.DRAFT_DEATH_FORM_TAB}
                                  component={ApplicationForm}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.REVIEW_EVENT_PARENT_FORM_TAB}
                                  component={ReviewForm}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.REGISTRAR_HOME}
                                  component={RegistrarHome}
                                />
                                <ProtectedRoute
                                  exact
                                  path={routes.REGISTRAR_HOME_TAB}
                                  component={RegistrarHome}
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
                                  path={routes.PRINT_CERTIFICATE}
                                  component={PrintCertificateAction}
                                />
                                <ProtectedRoute
                                  path={routes.SETTINGS}
                                  component={SettingsPage}
                                />
                                <ProtectedRoute
                                  path={routes.APPLICATION_DETAIL}
                                  component={Details}
                                />
                              </Switch>
                            </ProtectedPage>
                          </MainSection>
                          <Footer>
                            <p>OpenCRVS {new Date().getFullYear()}</p>
                          </Footer>
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
