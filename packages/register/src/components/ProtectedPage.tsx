import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { SecureAccount } from 'src/views/SecureAccount/SecureAccountView'
import { Unlock } from 'src/views/Unlock/Unlock'
import { storage } from 'src/storage'
import { withRouter, RouteComponentProps } from 'react-router'
import { isMobileDevice } from 'src/utils/commonUtils'
import IdleTimer from 'react-idle-timer'
import { USER_DETAILS } from 'src/utils/userUtils'
import { UserSetupPage } from 'src/views/UserSetup/UserSetupPage'
export const SCREEN_LOCK = 'screenLock'

interface IProtectPageState {
  secured: boolean
  pinExists: boolean
  pendingUser: boolean
}
class ProtectedPageComponent extends React.Component<
  RouteComponentProps<{}>,
  IProtectPageState
> {
  constructor(props: RouteComponentProps<{}>) {
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
    const newState = { ...this.state }
    if (!isVisible && !(await storage.getItem(SCREEN_LOCK))) {
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
  /* eventually we will take this pin from current user-details */
  async getPIN() {
    return await storage.getItem('pin')
  }

  onIdle() {
    this.setState({ secured: false })
  }

  render() {
    const { pendingUser, secured, pinExists } = this.state
    return (
      (pendingUser && <UserSetupPage />) ||
      (!pinExists && <SecureAccount onComplete={this.markAsSecured} />) ||
      (isMobileDevice() && (
        <PageVisibility onChange={this.handleVisibilityChange}>
          {(secured && this.props.children) ||
            (!secured && <Unlock onCorrectPinMatch={this.markAsSecured} />)}
        </PageVisibility>
      )) || (
        <IdleTimer
          onIdle={this.onIdle}
          timeout={window.config.DESKTOP_TIME_OUT_MILLISECONDS}
        >
          {(secured && this.props.children) ||
            (!secured && <Unlock onCorrectPinMatch={this.markAsSecured} />)}
        </IdleTimer>
      )
    )
  }
}
export const ProtectedPage = withRouter(ProtectedPageComponent)
