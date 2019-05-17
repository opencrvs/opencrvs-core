import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { History } from 'history'
import { Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
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
import { Home } from 'src/views/Home/Home'
import { createClient } from 'src/utils/apolloClient'
import { ReviewDuplicates } from './views/Duplicates/ReviewDuplicates'
import { SessionExpireConfirmation } from './components/SessionExpireConfirmation'
import { ConfirmationScreen } from './views/ConfirmationScreen/ConfirmationScreen'
import { PrintCertificateAction } from './views/PrintCertificate/PrintCertificateAction'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WorkQueue } from './views/WorkQueue/WorkQueue'
import { StyledErrorBoundary } from './components/StyledErrorBoundary'
import { SettingsPage } from './views/Settings/SettingsPage'

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}

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
                          <ProtectedPage>
                            <Switch>
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
                                path={routes.WORK_QUEUE}
                                component={WorkQueue}
                              />
                              <ProtectedRoute
                                exact
                                path={routes.WORK_QUEUE_TAB}
                                component={WorkQueue}
                              />
                              <ProtectedRoute
                                path={routes.CONFIRMATION_SCREEN}
                                component={ConfirmationScreen}
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
                                exact
                                path={routes.SETTINGS}
                                component={SettingsPage}
                              />
                            </Switch>
                          </ProtectedPage>
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
