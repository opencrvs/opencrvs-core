import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import { Page } from '@opencrvs/components/lib/layout/Page'
import { store, history } from './store'
import { Route } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import { config } from './config'
import { StepTwo } from './login/StepTwo'
import { getTheme } from '@opencrvs/components/lib/theme'
import { pageWrapper } from './common/PageWrapper'
import { StepOneContainer } from './login/StepOneContainer'

const StyledPage = styled(Page)`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
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
    font-family: ${({ theme }) => theme.fonts.defaultFontStyle};
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

export class App extends React.Component {
  public render() {
    return (
      <Provider store={store}>
        <IntlProvider locale={config.LANGUAGE}>
          <ThemeProvider theme={getTheme(config.LOCALE)}>
            <ConnectedRouter history={history}>
              <StyledPage>
                <Route
                  exact
                  path="/"
                  component={pageWrapper(StepOneContainer)}
                />
                <Route exact path="/smscode" component={pageWrapper(StepTwo)} />
              </StyledPage>
            </ConnectedRouter>
          </ThemeProvider>
        </IntlProvider>
      </Provider>
    )
  }
}
