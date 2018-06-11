import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { injectGlobal } from 'styled-components'
import { globalStyles } from '@opencrvs/components/lib/common/global'
import { LocaleThemes } from '@opencrvs/components/lib/common/global/LocaleThemes'
import { Page } from '@opencrvs/components/lib/common/Page'
import { Header } from '@opencrvs/components/lib/common/Header'
import { FlexWrapper } from '@opencrvs/components/lib/common/Flex'
import { Main } from '@opencrvs/components/lib/common/Main'
import { Nav } from '@opencrvs/components/lib/common/Nav'
import { store, history } from './store'
import { Route } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { RegistrationList } from './registrations/RegistrationList'
import { config } from './config'

// Injecting global styles for @font-face and the body tag - used only once
// tslint:disable-next-line
injectGlobal`${globalStyles}`

const messages = defineMessages({
  welcome: {
    id: 'app.welcome',
    defaultMessage: 'Welcome',
    description: 'Test text'
  }
})

const Title = injectIntl(({ intl }) => (
  <h1 className="App-title">{intl.formatMessage(messages.welcome)}</h1>
))

const Home = () => (
  <div>
    <Header>
      <FlexWrapper>
        <Nav>
          <Title />
        </Nav>
<<<<<<< HEAD
        </FlexWrapper>
=======
      </FlexWrapper>
>>>>>>> 0ef5bbc12bc670eb7a7f958afe90a0a71b8cf400
    </Header>
    <Main>
      <p>
        To get started, edit
        <code>src/App.tsx</code>
        and save to reload.
      </p>
      <RegistrationList />
    </Main>
  </div>
)
const Other = () => (
  <div className="App">
    <h1>page 2</h1>
  </div>
)

const client = new ApolloClient({
<<<<<<< HEAD
  uri: resolve(GRAPHQL_URL, 'graphql')
=======
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
>>>>>>> 0ef5bbc12bc670eb7a7f958afe90a0a71b8cf400
})
export class App extends React.Component<
  {
    client?: ApolloClient<{}>
  },
  {}
> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={store}>
<<<<<<< HEAD
          <IntlProvider locale={LANGUAGE}>
            <ThemeProvider theme={LocaleThemes[LOCALE]}>
=======
          <IntlProvider locale={config.LANGUAGE}>
            <ThemeProvider theme={LocaleThemes[config.LOCALE]}>
>>>>>>> 0ef5bbc12bc670eb7a7f958afe90a0a71b8cf400
              <ConnectedRouter history={history}>
                <Page>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/other" component={Other} />
                </Page>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlProvider>
        </Provider>
      </ApolloProvider>
    )
  }
}
