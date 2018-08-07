import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlContainer } from './i18n/IntlContainer'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { createStore, history } from './store'
import { Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { config } from './config'
import { getTheme } from '@opencrvs/components/lib/theme'
import { PageContainer } from './common/PageContainer'
import { RegistrationFormContainer } from './registrations/RegistrationFormContainer'
import { ProtectedRoute } from './common/ProtectedRoute'
import * as routes from './navigation/routes'

const client = new ApolloClient({
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
})

interface IAppProps {
  client?: ApolloClient<{}>
}

export const store = createStore()

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={store}>
          <IntlContainer>
            <ThemeProvider theme={getTheme(config.LOCALE)}>
              <ConnectedRouter history={history}>
                <PageContainer>
                  <Switch>
                    <ProtectedRoute
                      exact
                      path={routes.HOME}
                      component={RegistrationFormContainer}
                    />
                  </Switch>
                </PageContainer>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlContainer>
        </Provider>
      </ApolloProvider>
    )
  }
}
