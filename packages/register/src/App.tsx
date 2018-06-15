import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { Page } from './common/Page'
import { Wrapper } from './common/Wrapper'
import { Main } from './common/Main'
import { store, history } from './store'
import { Route } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import { RegistrationList } from './registrations/RegistrationList'
import { config } from './config'

import { Header } from '@opencrvs/components/lib/Header'
import { Nav } from '@opencrvs/components/lib/Nav'
import { Box } from '@opencrvs/components/lib/Box'
import { getTheme } from '@opencrvs/components/lib/theme'

const messages = defineMessages({
  welcome: {
    id: 'app.welcome',
    defaultMessage: 'Welcome',
    description: 'Test text'
  }
})

const Title = styled.h1`
  ${({ theme }) => theme.fonts.h1FontStyle};
`

const StyledPage = styled(Page)`
  background-color: ${({ theme }) => theme.colors.background};
  ${({ theme }) => theme.fonts.defaultFontStyle}

  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.lightFont};
    src:
      url('/fonts/notosans-light-webfont-${config.LANGUAGE}.woff')
      format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-regular-webfont-${config.LANGUAGE}.woff')
      format('woff');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    src:
      url('/fonts/notosans-bold-webfont-${config.LANGUAGE}.woff')
      format('woff');
    font-style: normal;
  }
`

const Home = injectIntl(({ intl }) => (
  <div>
    <Header>
      <Wrapper>
        <Nav>
          <Title>{intl.formatMessage(messages.welcome)}</Title>
        </Nav>
      </Wrapper>
    </Header>
    <Main>
      <Box id="loginBox" columns={6}>
        <RegistrationList />
      </Box>
    </Main>
  </div>
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
          <IntlProvider locale={config.LANGUAGE}>
            <ThemeProvider theme={getTheme(config.LOCALE)}>
              <ConnectedRouter history={history}>
                <StyledPage>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/other" component={Other} />
                </StyledPage>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlProvider>
        </Provider>
      </ApolloProvider>
    )
  }
}
