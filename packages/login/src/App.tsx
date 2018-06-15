import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import { localeThemes } from '@opencrvs/components/lib/localeThemes'
import { Page } from './common/Page'
import { Header } from '@opencrvs/components/lib/Header'
import { Wrapper } from './common/Wrapper'
import { Main } from './common/Main'
import { Nav } from '@opencrvs/components/lib/Nav'
import { Box } from '@opencrvs/components/lib/Box'
import { store, history } from './store'
import { Route } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { config } from './config'
import { MobileNumberForm } from './login/MobileNumberForm'

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
      <Wrapper>
        <Nav>
          <Title />
        </Nav>
      </Wrapper>
    </Header>
    <Main>
      <Box id="loginBox" columns={6}>
        <MobileNumberForm />
      </Box>
    </Main>
  </div>
)

export class App extends React.Component {
  public render() {
    return (
      <Provider store={store}>
        <IntlProvider locale={config.LANGUAGE}>
          <ThemeProvider theme={localeThemes[config.LOCALE]}>
            <ConnectedRouter history={history}>
              <Page>
                <Route exact path="/" component={Home} />
              </Page>
            </ConnectedRouter>
          </ThemeProvider>
        </IntlProvider>
      </Provider>
    )
  }
}
