import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { IntlContainer } from './i18n/components/I18nContainer'
import { createStore, history } from './store'
import { DarkPageContainer } from './common/PageContainer'
import * as routes from './navigation/routes'
import { StepTwoContainer } from './views/StepTwo/StepTwoContainer'
import { StepOneContainer } from './views/StepOne/StepOneContainer'
import { ErrorBoundary } from './ErrorBoundary'

export const store = createStore()
export class App extends React.Component {
  public render() {
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <IntlContainer>
            <ThemeProvider
              theme={getTheme(
                (window as Window & { config: { [key: string]: string } })
                  .config.COUNTRY,
                (window as Window & { config: { [key: string]: string } })
                  .config.LANGUAGE
              )}
            >
              <ConnectedRouter history={history}>
                <DarkPageContainer>
                  <Switch>
                    <Route exact path={routes.STEP_ONE}>
                      <StepOneContainer />
                    </Route>
                    <Route exact path={routes.STEP_TWO}>
                      <StepTwoContainer />
                    </Route>
                  </Switch>
                </DarkPageContainer>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlContainer>
        </Provider>
      </ErrorBoundary>
    )
  }
}
