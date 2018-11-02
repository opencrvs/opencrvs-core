import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { History } from 'history'
import { Header } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'
import { createStore, AppStore } from './store'
import { Page } from 'src/components/Page'
import styled, { ThemeProvider } from './styled-components'
import { config } from './config'
import Logo from './components/Logo'
import { I18nContainer } from './i18n/components/I18nContainer'

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`

interface IAppProps {
  store: AppStore
  history: History
}

export const store = createStore()
export class App extends React.Component<IAppProps> {
  public render() {
    return (
      <Provider store={this.props.store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(config.COUNTRY)}>
            <ConnectedRouter history={this.props.history}>
              <Page>
                <StyledHeader>
                  <Logo />
                </StyledHeader>
              </Page>
            </ConnectedRouter>
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    )
  }
}
