import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { History } from 'history'
import { Switch } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import { I18nContainer } from './i18n/components/I18nContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import { createStore, AppStore } from './store'
import { ProtectedRoute } from './components/ProtectedRoute'
import * as routes from './navigation/routes'
import { NotificationComponent } from './components/Notification'
import { Page } from './components/Page'
import { ProtectedPage } from './components/ProtectedPage'
import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from './views/SelectInformant/SelectInformant'
import { ApplicationForm } from './views/RegisterForm/ApplicationForm'
import { ReviewForm } from './views/RegisterForm/ReviewForm'
import { SearchResult } from './views/SearchResult/SearchResult'
import ScrollToTop from 'src/components/ScrollToTop'
import { createClient } from 'src/utils/apolloClient'
import { ReviewDuplicates } from './views/Duplicates/ReviewDuplicates'
import { SessionExpireConfirmation } from './components/SessionExpireConfirmation'
import { ConfirmationScreen } from './views/ConfirmationScreen/ConfirmationScreen'
import { PrintCertificateAction } from './views/PrintCertificate/PrintCertificateAction'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Details } from 'src/views/Home/Details'
import { StyledErrorBoundary } from './components/StyledErrorBoundary'
import { RegistrarHome } from './views/RegistrarHome/RegistrarHome'
import { FieldAgentHome } from './views/FieldAgentHome/FieldAgentHome'
import { Footer } from '@opencrvs/components/lib/interface/'
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
