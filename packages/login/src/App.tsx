import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { IntlContainer } from './i18n/components/I18nContainer'
import { createStore, history } from './store'
import { config } from './config'
import { PageContainer } from './common/PageContainer'
import * as routes from './navigation/routes'
import { StepTwoContainer } from './views/StepTwo/StepTwoContainer'
import { StepOneContainer } from './views/StepOne/StepOneContainer'

export const store = createStore()
export class App extends React.Component {
  public render() {
    return (
      <Provider store={store}>
        <IntlContainer>
          <ThemeProvider theme={getTheme(config.COUNTRY)}>
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
