import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlContainer } from './i18n/components/I18nContainer'
import { ConnectedRouter } from 'react-router-redux'
import { createStore, history } from './store'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { config } from './config'
import { StepTwoContainer } from './login/StepTwoContainer'
import { getTheme } from '../../components/lib/theme'
import { StepOneContainer } from './login/StepOneContainer'
import { PageContainer } from './common/PageContainer'
import * as routes from './navigation/routes'

export const store = createStore()

export class App extends React.Component {
  public render() {
    return (
      <Provider store={store}>
        <IntlContainer>
          <ThemeProvider theme={getTheme(config.LOCALE)}>
            <ConnectedRouter history={history}>
              <PageContainer>
                <Switch>
                  <Route
                    exact
                    path={routes.STEP_ONE}
                    component={StepOneContainer}
                  />
                  <Route
                    exact
                    path={routes.STEP_TWO}
                    component={StepTwoContainer}
                  />
                </Switch>
              </PageContainer>
            </ConnectedRouter>
          </ThemeProvider>
        </IntlContainer>
      </Provider>
    )
  }
}
