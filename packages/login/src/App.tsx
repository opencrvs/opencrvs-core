import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'

import { getTheme } from '@opencrvs/components/lib/theme'

import { IntlContainer } from '@login/i18n/components/I18nContainer'
import { createStore, history } from '@login/store'
import { DarkPageContainer } from '@login/common/PageContainer'
import * as routes from '@login/navigation/routes'
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { StepOneContainer } from '@login/views/StepOne/StepOneContainer'
import { ErrorBoundary } from '@login/ErrorBoundary'
import { getDefaultLanguage } from './i18n/utils'
import { ForgottenItem } from './views/resetCredentialsForm/forgottenItem'

export const store = createStore()
export class App extends React.Component {
  public render() {
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <IntlContainer>
            <ThemeProvider theme={getTheme(getDefaultLanguage())}>
              <ConnectedRouter history={history}>
                <DarkPageContainer>
                  <Switch>
                    <Route exact path={routes.STEP_ONE}>
                      <StepOneContainer />
                    </Route>
                    <Route exact path={routes.STEP_TWO}>
                      <StepTwoContainer />
                    </Route>
                    <Route exact path={routes.FORGOTTEN_ITEM}>
                      <ForgottenItem />
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
