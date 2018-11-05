import * as React from 'react'
import './App.css'
import { getTheme } from '@opencrvs/components/lib/theme'
import { Provider } from 'react-redux'
import { Page } from 'src/components/Page'
import { History } from 'history'
import { ThemeProvider } from './styled-components'
import { config } from './config'
import { I18nContainer } from 'src/i18n/components/I18nContainer'
import { createStore, AppStore } from 'src/store'
import { Switch } from 'react-router'
import * as routes from './navigation/routes'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from 'src/views/home/Home'
import { ConnectedRouter } from 'react-router-redux'

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
            <ConnectedRouter history={this.props.history}>
              <Page>
                <Switch>
                  <ProtectedRoute exact path={routes.HOME} component={Home} />
                </Switch>
              </Page>
            </ConnectedRouter>
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    )
  }
}
