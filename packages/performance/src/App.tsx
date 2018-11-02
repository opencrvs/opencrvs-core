import * as React from 'react'
import './App.css'
import { Header } from '@opencrvs/components/lib/interface'
import { getTheme } from '@opencrvs/components/lib/theme'
import { Provider } from 'react-redux'
import { Page } from 'src/components/Page'
import { History } from 'history'
import styled, { ThemeProvider } from './styled-components'
import { config } from './config'
import Logo from './components/Logo'
import { I18nContainer } from 'src/i18n/components/I18nContainer'
import { createStore, AppStore } from 'src/store'

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`
interface IAppProps {
  store: AppStore
  history: History
}
export const store = createStore()

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <Provider store={this.props.store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(config.COUNTRY)}>
            <Page>
              <StyledHeader>
                <Logo />
              </StyledHeader>
            </Page>
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    )
  }
}
