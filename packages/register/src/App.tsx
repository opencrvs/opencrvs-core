import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
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
import { loadOfflineData, storeOfflineData } from 'src/offline/actions'
import { IOfflineData } from 'src/offline/reducer'
import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from './views/SelectInformant/SelectInformant'
import { LoadingData } from './components/LoadingData'
import { ApplicationForm } from './views/RegisterForm/ApplicationForm'
import { ReviewForm } from './views/RegisterForm/ReviewForm'
import { SavedRegistration } from './views/SavedRegistration/SavedRegistration'
import { WorkQueue } from './views/WorkQueue/WorkQueue'
import ScrollToTop from 'src/components/ScrollToTop'
import { Home } from 'src/views/Home/Home'
import { storage } from 'src/storage'
import { setInitialDrafts } from 'src/drafts'
import { setInitialUserDetails } from 'src/profile/profileActions'
import { createClient } from 'src/utils/apolloClient'
import { USER_DETAILS } from 'src/utils/userUtils'
import { MyRecords } from './views/MyRecords/MyRecords'
import { ReviewDuplicates } from './views/Duplicates/ReviewDuplicates'
import { SessionExpireConfirmation } from './components/SessionExpireConfirmation'

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50%;
  left: 50%;
`

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}
interface IState {
  initialDraftsLoaded: boolean
  loadingDataModal: boolean
}
export const store = createStore()

export class App extends React.Component<IAppProps, IState> {
  constructor(props: IAppProps) {
    super(props)
    this.state = {
      initialDraftsLoaded: false,
      loadingDataModal: false
    }
  }
  toggleLoadingModal = () => {
    this.setState(state => ({
      loadingDataModal: !state.loadingDataModal
    }))
  }
  componentDidMount() {
    this.loadDataFromStorage()
  }
  async loadDataFromStorage() {
    const draftsString = await storage.getItem('drafts')
    const drafts = JSON.parse(draftsString ? draftsString : '[]')
    this.props.store.dispatch(setInitialDrafts(drafts))
    this.setState({ initialDraftsLoaded: true })
    const userDetailsString = await storage.getItem(USER_DETAILS)
    const userDetails = JSON.parse(userDetailsString ? userDetailsString : '[]')
    this.props.store.dispatch(setInitialUserDetails(userDetails))
    const offlineDataString = await storage.getItem('offline')
    const offlineData: IOfflineData = JSON.parse(
      offlineDataString ? offlineDataString : '{}'
    )
    if (!offlineData.locations) {
      this.toggleLoadingModal()
      this.props.store.dispatch(loadOfflineData())
    } else {
      this.props.store.dispatch(storeOfflineData(offlineData))
    }
  }

  public render() {
    const { initialDraftsLoaded } = this.state
    if (initialDraftsLoaded) {
      return (
        <ApolloProvider
          client={this.props.client || createClient(this.props.store)}
        >
          <Provider store={this.props.store}>
            <I18nContainer>
              <ThemeProvider theme={getTheme(config.COUNTRY)}>
                <ConnectedRouter history={this.props.history}>
                  <ScrollToTop>
                    <SessionExpireConfirmation />
                    <NotificationComponent>
                      <Page>
                        <LoadingData
                          show={this.state.loadingDataModal}
                          handleClose={this.toggleLoadingModal}
                        />
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
                            exact
                            path={routes.DRAFT_BIRTH_PARENT_FORM_TAB}
                            component={ApplicationForm}
                          />

                          <ProtectedRoute
                            exact
                            path={routes.DRAFT_DEATH_FORM}
                            component={ApplicationForm}
                          />

                          <ProtectedRoute
                            exact
                            path={routes.DRAFT_DEATH_FORM_TAB}
                            component={ApplicationForm}
                          />

                          <ProtectedRoute
                            exact
                            path={routes.REVIEW_BIRTH_PARENT_FORM_TAB}
                            component={ReviewForm}
                          />
                          <ProtectedRoute
                            path={routes.SAVED_REGISTRATION}
                            component={SavedRegistration}
                          />
                          <ProtectedRoute
                            path={routes.REJECTED_REGISTRATION}
                            component={SavedRegistration}
                          />
                          <ProtectedRoute
                            path={routes.WORK_QUEUE}
                            component={WorkQueue}
                          />
                          <ProtectedRoute
                            path={routes.MY_RECORDS}
                            component={MyRecords}
                          />
                          <ProtectedRoute
                            path={routes.REVIEW_DUPLICATES}
                            component={ReviewDuplicates}
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
