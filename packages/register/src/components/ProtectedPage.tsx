import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { SecureAccount } from 'src/views/SecureAccount/SecureAccountView'
import { Unlock } from 'src/views/Unlock/Unlock'
import { storage } from 'src/storage'
import { withRouter, RouteComponentProps } from 'react-router'

const SCREEN_LOCK = 'screenLock'
const PIN = 'pin'

interface IProtectPageState {
  secured: boolean
  pinExists: boolean
}
class ProtectedPageComponent extends React.Component<
  RouteComponentProps<{}>,
  IProtectPageState
> {
  constructor(props: RouteComponentProps<{}>) {
    super(props)
    this.state = {
      secured: true,
      pinExists: false
    }
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.markAsSecured = this.markAsSecured.bind(this)
  }
  async componentDidMount() {
    const newState = { ...this.state }
    if (await storage.getItem(SCREEN_LOCK)) {
      newState.secured = false
    }
    if (await storage.getItem(PIN)) {
      newState.pinExists = true
    }
    this.setState(newState)
  }

  async handleVisibilityChange(isVisible: boolean) {
    if (!isVisible && !(await storage.getItem(SCREEN_LOCK))) {
      const newState = { ...this.state }
      newState.secured = false
      /* eventually we will take this pin from current user-details */
      if (await storage.getItem(PIN)) {
        newState.pinExists = true
      } else {
        newState.pinExists = false
      }
      this.setState(newState)
      storage.setItem(SCREEN_LOCK, 'true')
    }
  }
  markAsSecured() {
    this.setState({ secured: true })
    storage.removeItem(SCREEN_LOCK)
  }

  render() {
    const { secured, pinExists } = this.state
    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        {(secured && this.props.children) ||
          (!secured && !pinExists && (
            <SecureAccount onComplete={this.markAsSecured} />
          )) ||
          (!secured && pinExists && (
            <Unlock onCorrectPinMatch={this.markAsSecured} />
          ))}
      </PageVisibility>
    )
  }
}
export const ProtectedPage = withRouter(ProtectedPageComponent)
