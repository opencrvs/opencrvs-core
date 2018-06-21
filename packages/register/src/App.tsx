import * as React from 'react'
import { Provider } from 'react-redux'
import { injectIntl } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { store, history } from './store'
import { Route } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import { RegistrationList } from './registrations/RegistrationList'
import { config } from './config'
import { Box } from '@opencrvs/components/lib/Box'
import { getTheme } from '@opencrvs/components/lib/theme'
import { PageContainer } from './common/PageContainer'
import { IntlContainer } from './i18n/IntlContainer'

const Title = styled.h1`
  ${({ theme }) => theme.fonts.h1FontStyle};
`

const Home = injectIntl(({ intl }) => (
  <Box id="registerDashboard" columns={6}>
    <RegistrationList />
  </Box>
))

const Other = () => (
  <div className="App">
    <Title>page 2</Title>
  </div>
)

const client = new ApolloClient({
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
})

interface IAppProps {
  client?: ApolloClient<{}>
}

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={store}>
          <IntlContainer>
            <ThemeProvider theme={getTheme(config.LOCALE)}>
              <ConnectedRouter history={history}>
                <PageContainer>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/other" component={Other} />
                </PageContainer>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlContainer>
        </Provider>
      </ApolloProvider>
    )
  }
}
