import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { IntlContainer } from './i18n/components/I18nContainer'
import { createStore, history } from './store'
import { PageContainer, DarkPageContainer } from './common/PageContainer'
import * as routes from './navigation/routes'
import { StepTwoContainer } from './views/StepTwo/StepTwoContainer'
import { StepOneContainer } from './views/StepOne/StepOneContainer'
import { ManagerViewContainer } from './views/Manager/ManagerView'
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
                  .config.COUNTRY
              )}
            >
              <ConnectedRouter history={history}>
                <Switch>
                  <Route exact path={routes.STEP_ONE}>
                    <DarkPageContainer>
                      <StepOneContainer />
                    </DarkPageContainer>
                  </Route>
                  <Route exact path={routes.STEP_TWO}>
                    <DarkPageContainer>
                      <StepTwoContainer />
                    </DarkPageContainer>
                  </Route>
                  <Route exact path={routes.MANAGER}>
                    <PageContainer>
                      <ManagerViewContainer />
                    </PageContainer>
                  </Route>
                </Switch>
              </ConnectedRouter>
            </ThemeProvider>
          </IntlContainer>
        </Provider>
      </ErrorBoundary>
    )
  }
}
