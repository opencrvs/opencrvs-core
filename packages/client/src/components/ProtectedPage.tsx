/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { Unlock } from '@client/views/Unlock/Unlock'
import { storage } from '@client/storage'
import { isMobileDevice } from '@client/utils/commonUtils'
import IdleTimer from 'react-idle-timer'
import { USER_DETAILS, UserDetails } from '@client/utils/userUtils'
import { ProtectedAccount } from '@client/components/ProtectedAccount'
import { getCurrentUserID, IUserData } from '@client/declarations'
import { DESKTOP_TIME_OUT_MILLISECONDS } from '@client/utils/constants'
import { connect } from 'react-redux'
import { refreshOfflineData } from '@client/offline/actions'
import { PropsWithChildren } from 'react'
import { ForgotPIN } from '@client/views/Unlock/ForgotPIN'
import { showPINUpdateSuccessToast } from '@client/notification/actions'
import { CreatePin } from '@client/views/PIN/CreatePin'
import {
  redirectToAuthentication,
  setInitialUserDetails
} from '@client/profile/profileActions'
import { LoadingBar } from '@opencrvs/components/src/LoadingBar/LoadingBar'
import { RouteComponentProps, withRouter } from './WithRouterProps'
import { getAuthenticated } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { shouldBypassLock } from '@client/utils/lockBypass'
export const SCREEN_LOCK = 'screenLock'

type OwnProps = PropsWithChildren<{}>

type DispatchProps = {
  onNumPadVisible: () => void
  showPINUpdateSuccessToast: typeof showPINUpdateSuccessToast
  redirectToAuthentication: typeof redirectToAuthentication
  setInitialUserDetails: typeof setInitialUserDetails
}
interface IProtectPageState {
  loading: boolean
  secured: boolean
  pinExists: boolean
  pendingUser: boolean
  forgotPin: boolean
  passwordVerified: boolean
}

type Props = OwnProps &
  DispatchProps &
  RouteComponentProps<{
    authenticated: boolean
    userDetailsFetched: boolean
  }>

class ProtectedPageComponent extends React.Component<Props, IProtectPageState> {
  constructor(props: Props) {
    super(props)
    this.state = {
      loading: true,
      secured: true,
      pinExists: true,
      pendingUser: false,
      forgotPin: false,
      passwordVerified: false
    }
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.handleWindowFocus = this.handleWindowFocus.bind(this)
    this.markAsSecured = this.markAsSecured.bind(this)
    this.onIdle = this.onIdle.bind(this)
  }

  async componentDidMount() {
    const mountedOn = Date.now()
    const newState = { ...this.state }

    if (await storage.getItem(SCREEN_LOCK)) {
      newState.secured = false
    } else {
      newState.secured = true
    }
    if (await this.getPIN()) {
      newState.pinExists = true
    } else {
      newState.pinExists = false
    }
    const userDetails: UserDetails = JSON.parse(
      (await storage.getItem(USER_DETAILS)) || '{}'
    )
    if (userDetails && userDetails.status && userDetails.status === 'pending') {
      newState.pendingUser = true
    }

    newState.loading = false
    const timeSinceMount = Date.now() - mountedOn
    const progress = document.getElementById('progress')
    if (progress != null) progress.style.width = '100%'
    setTimeout(
      () => {
        this.setState(newState)
      },
      import.meta.env.PROD ? Math.max(200, 2000 - timeSinceMount) : 0
    )

    // Re-fetch the logged-in user's own information whenever the app regains
    // focus, so changes made by an administrator on another device (e.g. a
    // new office/location) are reflected without requiring a re-login.
    window.addEventListener('focus', this.handleWindowFocus)
    document.addEventListener('visibilitychange', this.handleWindowFocus)
  }

  componentDidUpdate(prevProps: Props) {
    // Re-fetch the logged-in user's own information on every in-app navigation,
    // so an administrator's change (e.g. a new office/location) is reflected as
    // soon as the user moves around the app.
    const prev = prevProps.router.location
    const next = this.props.router.location
    if (
      prev &&
      next &&
      (prev.pathname !== next.pathname || prev.search !== next.search)
    ) {
      this.props.setInitialUserDetails()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.handleWindowFocus)
    document.removeEventListener('visibilitychange', this.handleWindowFocus)
  }

  handleWindowFocus() {
    if (document.visibilityState === 'hidden') {
      return
    }
    // Re-runs the cache-read + server-refetch chain. Fails gracefully when
    // offline and retries on the next focus once back online.
    this.props.setInitialUserDetails()
  }

  async handleVisibilityChange(isVisible: boolean) {
    const alreadyLocked = isVisible || (await storage.getItem(SCREEN_LOCK))

    const lockShouldBeBypassed = shouldBypassLock()

    const newState = { ...this.state }

    if (!alreadyLocked && !lockShouldBeBypassed) {
      newState.secured = false
      if (await this.getPIN()) {
        newState.pinExists = true
      } else {
        newState.pinExists = false
      }
      this.setState(newState)
      storage.setItem(SCREEN_LOCK, 'true')
    }

    // App was in the background and now we need to make sure
    // both global configuration and offlineCountryConfig data is up-to-date
    if (isVisible) {
      this.props.onNumPadVisible()
    }
  }

  markAsSecured() {
    this.setState({
      secured: true,
      pinExists: true,
      passwordVerified: false,
      forgotPin: false
    })
    storage.removeItem(SCREEN_LOCK)
  }

  async getPIN(): Promise<string> {
    const currentUserID = await getCurrentUserID()
    const userData = await storage.getItem('USER_DATA')

    if (!userData) {
      return ''
    }
    const allUserData = JSON.parse(userData) as IUserData[]
    if (!allUserData || !allUserData.length) {
      return ''
    }
    const currentUserData = allUserData.find(
      (user) => user.userID === currentUserID
    )
    return (currentUserData && currentUserData.userPIN) || ''
  }

  onIdle() {
    storage.setItem(SCREEN_LOCK, 'true')
    this.setState({ secured: false })
  }

  renderLoadingScreen() {
    return <LoadingBar />
  }

  conditionalRenderUponSecuredState() {
    const { secured, loading, forgotPin } = this.state

    const { children, authenticated, userDetailsFetched } = this.props

    if (loading || (!authenticated && !userDetailsFetched)) {
      return this.renderLoadingScreen()
    }

    if (secured) {
      return children
    }

    if (!secured) {
      if (forgotPin) {
        return (
          <ForgotPIN
            goBack={() => this.setState({ forgotPin: false })}
            onVerifyPassword={() => this.setState({ passwordVerified: true })}
          />
        )
      }

      return (
        <Unlock
          onCorrectPinMatch={this.markAsSecured}
          onForgetPin={() => this.setState({ forgotPin: true })}
        />
      )
    }

    return null
  }

  render() {
    const { pendingUser, pinExists, passwordVerified } = this.state

    if (pendingUser) {
      return <ProtectedAccount />
    }

    if (!pinExists || passwordVerified) {
      return (
        <CreatePin
          onComplete={() => {
            if (passwordVerified) {
              this.props.showPINUpdateSuccessToast()
            }
            this.markAsSecured()
          }}
        />
      )
    }

    if (isMobileDevice()) {
      return (
        <PageVisibility onChange={this.handleVisibilityChange}>
          {this.conditionalRenderUponSecuredState()}
        </PageVisibility>
      )
    }
    return (
      // TODO: IdleTimer doesn't have children in it's type definition, due to React 18 starting to require it
      // We would need to update IdleTimer to it's 5 version, which changed its API
      // @ts-ignore
      <IdleTimer onIdle={this.onIdle} timeout={DESKTOP_TIME_OUT_MILLISECONDS}>
        {this.conditionalRenderUponSecuredState()}
      </IdleTimer>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    authenticated: getAuthenticated(store),
    userDetailsFetched: store.profile.userDetailsFetched
  }
}

const mapDispatchToProps = {
  onNumPadVisible: refreshOfflineData,
  showPINUpdateSuccessToast,
  redirectToAuthentication,
  setInitialUserDetails
}

export const ProtectedPage = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProtectedPageComponent)
)
