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
import { refreshToken } from '@client/utils/authUtils'
import {
  DESKTOP_TIME_OUT_MILLISECONDS,
  REFRESH_TOKEN_CHECK_MILLIS
} from '@client/utils/constants'
import { connect } from 'react-redux'
import { refreshOfflineData } from '@client/offline/actions'
import { PropsWithChildren } from 'react'
import { ForgotPIN } from '@client/views/Unlock/ForgotPIN'
import { showPINUpdateSuccessToast } from '@client/notification/actions'
import { CreatePin } from '@client/views/PIN/CreatePin'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { LoadingBar } from '@opencrvs/components/src/LoadingBar/LoadingBar'
import { RouteComponentProps, withRouter } from './WithRouterProps'
import { getAuthenticated } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
export const SCREEN_LOCK = 'screenLock'

type OwnProps = PropsWithChildren<{
  unprotectedRouteElements: string[]
}>

type DispatchProps = {
  onNumPadVisible: () => void
  showPINUpdateSuccessToast: typeof showPINUpdateSuccessToast
  redirectToAuthentication: typeof redirectToAuthentication
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

    setInterval(async () => {
      if (!(await refreshToken())) this.props.redirectToAuthentication()
    }, REFRESH_TOKEN_CHECK_MILLIS)
  }

  async handleVisibilityChange(isVisible: boolean) {
    const alreadyLocked = isVisible || (await storage.getItem(SCREEN_LOCK))

    const onUnprotectedPage = this.props.unprotectedRouteElements?.some(
      (route) => this.props.router.location.pathname.includes(route)
    )

    const newState = { ...this.state }

    if (!alreadyLocked && !onUnprotectedPage) {
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
  redirectToAuthentication
}

export const ProtectedPage = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProtectedPageComponent)
)
