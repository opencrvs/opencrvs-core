import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { History } from 'history'
import { Switch } from 'react-router'
import { I18nContainer } from './i18n/components/I18nContainer'

import { createStore, AppStore } from './store'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from 'src/views/home/Home'

import { Header } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'

import { Page } from 'src/components/Page'
import styled, { ThemeProvider } from './styled-components'
import { config } from './config'
import Logo from './components/Logo'

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`

const client = new ApolloClient({
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
})

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}
interface IState {
  initialDraftsLoaded: boolean
}
export const store = createStore()

export class App extends React.Component<IAppProps, IState> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={this.props.store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme(config.COUNTRY)}>
              <ConnectedRouter history={this.props.history}>
                <Page>
                  <StyledHeader>
                    <Logo />
                  </StyledHeader>
                  <Switch>
                    <ProtectedRoute exact path={'/'} component={Home} />
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
