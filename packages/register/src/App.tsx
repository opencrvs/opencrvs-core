import * as React from 'react'
import { Provider, connect } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { History } from 'history'
import { Switch } from 'react-router'
import styled, { ThemeProvider } from 'styled-components'
import gql from 'graphql-tag'

import { I18nContainer } from './i18n/components/I18nContainer'

import { getTheme } from '@opencrvs/components/lib/theme'
import { Spinner } from '@opencrvs/components/lib/interface'

import { createStore, AppStore, IStoreState } from './store'
import { config } from './config'
import { ProtectedRoute } from './components/ProtectedRoute'
import * as routes from './navigation/routes'

import { NotificationComponent } from './components/Notification'
import { Page } from './components/Page'

import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from './views/SelectInformant/SelectInformant'

import { RegisterForm } from './views/RegisterForm/RegisterForm'
import { SavedRegistration } from './views/SavedRegistration/SavedRegistration'
import { WorkQueue } from './views/WorkQueue/WorkQueue'
import ScrollToTop from 'src/components/ScrollToTop'
import { Home } from 'src/views/Home/Home'
import { storage } from 'src/storage'
import { setInitialDrafts } from 'src/drafts'
import { ITokenPayload } from '@opencrvs/register/src/utils/authUtils'
import { getTokenPayload } from 'src/profile/profileSelectors'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { setUserDetails } from '@opencrvs/register/src/profile/profileActions'
import { client } from 'src/utils/apolloClient'

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50%;
  left: 50%;
`

const FETCH_USER = gql`
  query($userId: String!) {
    getUser(userId: $userId) {
      catchmentArea {
        id
        name
        status
      }
      primaryOffice {
        id
        name
        status
      }
    }
  }
`

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
  initialDraftsLoaded: boolean
  userDetailsFetched: boolean
  tokenPayload: ITokenPayload
}
export const store = createStore()

class AppComponent extends React.Component<IAppProps> {
  componentWillMount() {
    this.loadDraftsFromStorage()
  }

  componentDidUpdate(prevProps: IAppProps) {
    if (prevProps.tokenPayload !== this.props.tokenPayload) {
      this.fetchUserDetails(this.props.tokenPayload.sub)
    }
  }
  async loadDraftsFromStorage() {
    const draftsString = await storage.getItem('drafts')
    const drafts = JSON.parse(draftsString ? draftsString : '[]')
    this.props.store.dispatch(setInitialDrafts(drafts))
  }

  async fetchUserDetails(userId: string) {
    const response = await (this.props.client || client).query({
      query: FETCH_USER,
      variables: { userId }
    })
    const data: GQLQuery = response.data
    if (data && data.getUser) {
      this.props.store.dispatch(setUserDetails(data.getUser))
    }
  }

  public render() {
    const { initialDraftsLoaded } = this.props

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
                            component={RegisterForm}
                          />

                          <ProtectedRoute
                            path={routes.DRAFT_BIRTH_PARENT_FORM_TAB}
                            component={RegisterForm}
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
export const App = connect((state: IStoreState) => ({
  initialDraftsLoaded: state.drafts.initialDraftsLoaded,
  tokenPayload: getTokenPayload(state),
  userDetailsFetched: state.profile.userDetailsFetched
}))(AppComponent)
