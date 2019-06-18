import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { IntlContainer } from '@login/i18n/components/I18nContainer'
import { createStore, history } from '@login/store'
import { PageContainer, DarkPageContainer } from '@login/common/PageContainer'
import * as routes from '@login/navigation/routes'
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { StepOneContainer } from '@login/views/StepOne/StepOneContainer'
import { ManagerViewContainer } from '@login/views/Manager/ManagerView'
import { ErrorBoundary } from '@login/ErrorBoundary'

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
