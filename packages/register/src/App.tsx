import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { History } from 'history'
import { Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { I18nContainer } from './i18n/I18nContainer'

import { getTheme } from '@opencrvs/components/lib/theme'

import { createStore, AppStore } from './store'
import { config } from './config'
import { ProtectedRoute } from './components/ProtectedRoute'
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
  store: AppStore
  history: History
}

export const store = createStore()

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={this.props.store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme(config.LOCALE)}>
              <ConnectedRouter history={this.props.history}>
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
                      exact
                      path={routes.BIRTH_PARENT_FORM}
                      component={BirthParentForm}
                    />
                    <ProtectedRoute
                      path={routes.BIRTH_PARENT_FORM_TAB}
                      component={BirthParentForm}
                    />
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
