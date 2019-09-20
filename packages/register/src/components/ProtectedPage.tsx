import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { SecureAccount } from '@register/views/SecureAccount/SecureAccountView'
import { Unlock } from '@register/views/Unlock/Unlock'
import { storage } from '@register/storage'
import { withRouter, RouteComponentProps } from 'react-router'
import { isMobileDevice } from '@register/utils/commonUtils'
import IdleTimer from 'react-idle-timer'
import { USER_DETAILS } from '@register/utils/userUtils'
import { ProtectedAccount } from '@register/components/ProtectedAccount'
import { getCurrentUserID, IUserData } from '@register/applications'
export const SCREEN_LOCK = 'screenLock'

interface IProtectedPageProps {
  unprotectedRouteElements: string[]
}
interface IProtectPageState {
  secured: boolean
  pinExists: boolean
  pendingUser: boolean
}
class ProtectedPageComponent extends React.Component<
  IProtectedPageProps & RouteComponentProps<{}>,
  IProtectPageState
> {
  constructor(props: IProtectedPageProps & RouteComponentProps<{}>) {
    super(props)
    this.state = {
      secured: true,
      pinExists: true,
      pendingUser: false
    }
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.markAsSecured = this.markAsSecured.bind(this)
    this.onIdle = this.onIdle.bind(this)
  }

  async componentDidMount() {
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
    const userDetails = JSON.parse(
      (await storage.getItem(USER_DETAILS)) || '{}'
    )
    if (userDetails && userDetails.status && userDetails.status === 'pending') {
      newState.pendingUser = true
    }
    this.setState(newState)
  }

  async handleVisibilityChange(isVisible: boolean) {
    const alreadyLocked = isVisible || (await storage.getItem(SCREEN_LOCK))
    const onUnprotectedPage = this.props.unprotectedRouteElements.some(route =>
      this.props.location.pathname.includes(route)
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
  }

  markAsSecured() {
    this.setState({ secured: true, pinExists: true })
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
      user => user.userID === currentUserID
    )
    return (currentUserData && currentUserData.userPIN) || ''
  }

  onIdle() {
    this.setState({ secured: false })
  }
  render() {
    const { pendingUser, secured, pinExists } = this.state

    if (pendingUser) {
      return <ProtectedAccount />
    }

    if (!pinExists) {
      return <SecureAccount onComplete={this.markAsSecured} />
    }

    if (isMobileDevice()) {
      return (
        <PageVisibility onChange={this.handleVisibilityChange}>
          {(secured && this.props.children) ||
            (!secured && <Unlock onCorrectPinMatch={this.markAsSecured} />)}
        </PageVisibility>
      )
    }
    return (
      <IdleTimer
        onIdle={this.onIdle}
        timeout={window.config.DESKTOP_TIME_OUT_MILLISECONDS}
      >
        {(secured && this.props.children) ||
          (!secured && <Unlock onCorrectPinMatch={this.markAsSecured} />)}
      </IdleTimer>
    )
  }
}
export const ProtectedPage = withRouter(ProtectedPageComponent)
