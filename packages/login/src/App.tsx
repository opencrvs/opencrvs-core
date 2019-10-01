import { DarkPageContainer } from '@login/common/PageContainer'
import { ErrorBoundary } from '@login/ErrorBoundary'
import { IntlContainer } from '@login/i18n/components/I18nContainer'
import * as routes from '@login/navigation/routes'
import { createStore, history } from '@login/store'
import { StepOneContainer } from '@login/views/StepOne/StepOneContainer'
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'
import { ThemeProvider } from 'styled-components'
import { getDefaultLanguage } from './i18n/utils'
import { ForgottenItem } from './views/resetCredentialsForm/forgottenItemForm'
import { ResetCredentialsSuccessPage } from './views/resetCredentialsForm/resetCredentialsSuccessPage'
import { PhoneNumberVerification } from './views/resetCredentialsForm/phoneNumberVerificationForm'
import { RecoveryCodeEntry } from './views/resetCredentialsForm/recoveryCodeEntryForm'
import { SecurityQuestion } from './views/resetCredentialsForm/securityQuestionForm'
import { UpdatePassword } from './views/resetCredentialsForm/updatePasswordForm'

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
                    <Route
                      component={PhoneNumberVerification}
                      exact
                      path={routes.PHONE_NUMBER_VERIFICATION}
                    ></Route>
                    <Route
                      exact
                      path={routes.RECOVERY_CODE_ENTRY}
                      component={RecoveryCodeEntry}
                    ></Route>
                    <Route
                      exact
                      path={routes.SECURITY_QUESTION}
                      component={SecurityQuestion}
                    ></Route>
                    <Route
                      exact
                      path={routes.UPDATE_PASSWORD}
                      component={UpdatePassword}
                    ></Route>
                    <Route
                      exact
                      path={routes.SUCCESS}
                      component={ResetCredentialsSuccessPage}
                    ></Route>
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
