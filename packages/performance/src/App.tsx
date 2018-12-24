import * as React from 'react'
import { getTheme } from '@opencrvs/components/lib/theme'
import ApolloClient from 'apollo-client'
import { storage } from 'src/storage'
import { USER_DETAILS } from 'src/utils/userUtils'
import { setInitialUserDetails } from 'src/profile/actions'
import { Provider } from 'react-redux'
import { Page } from 'src/components/Page'
import { History } from 'history'
import { ThemeProvider } from './styled-components'
import { config } from './config'
import { I18nContainer } from 'src/i18n/components/I18nContainer'
import { createStore, AppStore } from 'src/store'
import { Switch } from 'react-router'
import * as routes from './navigation/routes'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from 'src/views/home/Home'
import { ConnectedRouter } from 'react-router-redux'
import { client } from 'src/utils/apolloClient'
import { ApolloProvider } from 'react-apollo'

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
      <ApolloProvider client={this.props.client || client}>
        <Provider store={this.props.store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme(config.COUNTRY)}>
              <ConnectedRouter history={this.props.history}>
                <Page>
                  <Switch>
                    <ProtectedRoute exact path={routes.HOME} component={Home} />
                  </Switch>
                </Page>
              </ConnectedRouter>
            </ThemeProvider>
          </I18nContainer>
        </Provider>
      </ApolloProvider>
    )
  }
}
