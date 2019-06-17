import * as React from 'react'
import { getTheme } from '@opencrvs/components/lib/theme'
import ApolloClient from 'apollo-client'
import { storage } from '@performance/storage'
import { USER_DETAILS } from '@performance/utils/userUtils'
import { setInitialUserDetails } from '@performance/profile/actions'
import { Provider } from 'react-redux'
import { Page } from '@performance/components/Page'
import { History } from 'history'
import { ThemeProvider } from '@performance/styledComponents'
import { I18nContainer } from '@performance/i18n/components/I18nContainer'
import { createStore, AppStore } from '@performance/store'
import { Switch } from 'react-router'
import * as routes from '@performance/navigation/routes'
import { ProtectedRoute } from '@performance/components/ProtectedRoute'
import { Home } from '@performance/views/home/Home'
import { ConnectedRouter } from 'react-router-redux'
import { client } from '@performance/utils/apolloClient'
import { ApolloProvider } from 'react-apollo'
import { ErrorBoundary } from '@performance/components/ErrorBoundary'

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}
export const store = createStore()

export class App extends React.Component<IAppProps, {}> {
  componentWillMount() {
    this.loadUserDetails()
  }
  async loadUserDetails() {
    const userDetailsString = await storage.getItem(USER_DETAILS)
    const userDetails = JSON.parse(userDetailsString ? userDetailsString : '[]')
    this.props.store.dispatch(setInitialUserDetails(userDetails))
  }
  public render() {
    return (
      <ErrorBoundary>
        <ApolloProvider client={this.props.client || client}>
          <Provider store={this.props.store}>
            <I18nContainer>
              <ThemeProvider
                theme={getTheme(window.config.COUNTRY, window.config.LANGUAGE)}
              >
                <ConnectedRouter history={this.props.history}>
                  <Page>
                    <Switch>
                      <ProtectedRoute
                        exact
                        path={routes.HOME}
                        component={Home}
                      />
                    </Switch>
                  </Page>
                </ConnectedRouter>
              </ThemeProvider>
            </I18nContainer>
          </Provider>
        </ApolloProvider>
      </ErrorBoundary>
    )
  }
}
