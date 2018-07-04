import * as React from 'react'
import { Provider, Store } from 'react-redux'
import { IntlContainer } from './i18n/IntlContainer'
import { ConnectedRouter } from 'react-router-redux'
import { createStore } from './store'
import { Route, Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { config } from './config'
import { StepTwoContainer } from './login/StepTwoContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import { StepOneContainer } from './login/StepOneContainer'
import { PageContainer } from './common/PageContainer'
import * as routes from './navigation/routes'
import { History } from '../../../node_modules/@types/history'

interface IProps {
  history: History
}

export class App extends React.Component<IProps> {
  store: Store<{}>

  constructor(props: IProps) {
    super(props)
    this.store = createStore(props.history)
  }
  public render() {
    return (
      <Provider store={this.store}>
        <IntlContainer>
          <ThemeProvider theme={getTheme(config.LOCALE)}>
            <ConnectedRouter history={this.props.history}>
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
