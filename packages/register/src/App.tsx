import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { IntlContainer } from './i18n/IntlContainer'

import { getTheme } from '@opencrvs/components/lib/theme'

import { createStore, history } from './store'
import { config } from './config'
import { ProtectedRoute } from '@opencrvs/register/src/components/ProtectedRoute'
import * as routes from './navigation/routes'

import { Page } from './components/Page'

import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from './views/SelectInformant/SelectInformant'
import { BirthParentForm } from './views/BirthParentForm/BirthParentForm'

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
                <Page>
                  <Switch>
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
                      path={routes.BIRTH_PARENT_FORM}
                      component={BirthParentForm}
                    />
                  </Switch>
                </Page>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlContainer>
        </Provider>
      </ApolloProvider>
    )
  }
}
