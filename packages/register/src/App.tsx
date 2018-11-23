import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { resolve } from 'url'
import { History } from 'history'
import { Switch } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import { I18nContainer } from './i18n/components/I18nContainer'

import { getTheme } from '@opencrvs/components/lib/theme'
import { Spinner } from '@opencrvs/components/lib/interface'

import { createStore, AppStore } from './store'
import { config } from './config'
import { ProtectedRoute } from './components/ProtectedRoute'
import * as routes from './navigation/routes'

import { NotificationComponent } from './components/Notification'
import { Page } from './components/Page'

import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from './views/SelectInformant/SelectInformant'

import { ApplicationForm } from './views/RegisterForm/ApplicationForm'
import { ReviewForm } from './views/RegisterForm/ReviewForm'
import { SavedRegistration } from './views/SavedRegistration/SavedRegistration'
import { WorkQueue } from './views/WorkQueue/WorkQueue'
import ScrollToTop from 'src/components/ScrollToTop'
import { Home } from 'src/views/Home/Home'
import { storage } from 'src/storage'
import { setInitialDrafts } from 'src/drafts'

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50%;
  left: 50%;
`

const httpLink = createHttpLink({
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('opencrvs')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}
interface IState {
  initialDraftsLoaded: boolean
}
export const store = createStore()

export class App extends React.Component<IAppProps, IState> {
  constructor(props: IAppProps) {
    super(props)
    this.state = {
      initialDraftsLoaded: false
    }
  }
  componentWillMount() {
    this.loadDraftsFromStorage()
  }
  async loadDraftsFromStorage() {
    const draftsString = await storage.getItem('drafts')
    const drafts = JSON.parse(draftsString ? draftsString : '[]')
    this.props.store.dispatch(setInitialDrafts(drafts))
    this.setState({ initialDraftsLoaded: true })
  }

  public render() {
    const { initialDraftsLoaded } = this.state
    if (initialDraftsLoaded) {
      return (
        <ApolloProvider client={this.props.client || client}>
          <Provider store={this.props.store}>
            <I18nContainer>
              <ThemeProvider theme={getTheme(config.COUNTRY)}>
                <ConnectedRouter history={this.props.history}>
                  <ScrollToTop>
                    <NotificationComponent>
                      <Page>
                        <Switch>
                          <ProtectedRoute
                            exact
                            path={routes.HOME}
                            component={Home}
                          />
                          <ProtectedRoute
                            exact
                            path={routes.SELECT_VITAL_EVENT}
                            component={SelectVitalEvent}
                          />
                          <ProtectedRoute
                            exact
                            path={routes.SELECT_INFORMANT}
                            component={SelectInformant}
                          />
                          <ProtectedRoute
                            exact
                            path={routes.DRAFT_BIRTH_PARENT_FORM}
                            component={ApplicationForm}
                          />

                          <ProtectedRoute
                            path={routes.DRAFT_BIRTH_PARENT_FORM_TAB}
                            component={ApplicationForm}
                          />

                          <ProtectedRoute
                            path={routes.REVIEW_BIRTH_PARENT_FORM_TAB}
                            component={ReviewForm}
                          />
                          <ProtectedRoute
                            path={routes.SAVED_REGISTRATION}
                            component={SavedRegistration}
                          />
                          <ProtectedRoute
                            path={routes.WORK_QUEUE}
                            component={WorkQueue}
                          />
                        </Switch>
                      </Page>
                    </NotificationComponent>
                  </ScrollToTop>
                </ConnectedRouter>
              </ThemeProvider>
            </I18nContainer>
          </Provider>
        </ApolloProvider>
      )
    } else {
      return (
        <ThemeProvider theme={getTheme(config.COUNTRY)}>
          <StyledSpinner id="appSpinner" />
        </ThemeProvider>
      )
    }
  }
}
