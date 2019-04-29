import * as React from 'react'
import { getTheme } from '@opencrvs/components/lib/theme'
import ApolloClient from 'apollo-client'
import { storage } from 'storage'
import { USER_DETAILS } from 'utils/userUtils'
import { setInitialUserDetails } from 'profile/actions'
import { Provider } from 'react-redux'
import { Page } from 'components/Page'
import { History } from 'history'
import { ThemeProvider } from './styled-components'
import { I18nContainer } from 'i18n/components/I18nContainer'
import { createStore, AppStore } from 'store'
import { Switch } from 'react-router'
import * as routes from './navigation/routes'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from 'views/home/Home'
import { ConnectedRouter } from 'react-router-redux'
import { client } from 'utils/apolloClient'
import { ApolloProvider } from 'react-apollo'
import { ErrorBoundary } from './components/ErrorBoundary'

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
              <ThemeProvider theme={getTheme(window.config.COUNTRY)}>
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
