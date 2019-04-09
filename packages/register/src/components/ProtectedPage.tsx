import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { SecureAccount } from 'src/views/SecureAccount/SecureAccountView'
import { storage } from 'src/storage'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { IStoreState } from '@opencrvs/register/src/store'
import { IUserDetails } from '../utils/userUtils'
import { getUserDetails } from 'src/profile/profileSelectors'

const SCREEN_LOCK = 'screenLock'
const PIN = 'pin'
interface IProtectPageProps {
  userDetails: IUserDetails
}
interface IProtectPageState {
  secured: boolean
  pinExists: boolean
}
class ProtectedPageComponent extends React.Component<
  RouteComponentProps<{}> & IProtectPageProps,
  IProtectPageState
> {
  constructor(props: RouteComponentProps<{}> & IProtectPageProps) {
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
    if (
      this.props.userDetails.role &&
      this.props.userDetails.role === 'FIELD_AGENT' &&
      !isVisible &&
      !(await storage.getItem(SCREEN_LOCK))
    ) {
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
            <div onClick={() => this.markAsSecured()}> unlock screen </div>
          ))}
      </PageVisibility>
    )
  }
}

const mapStateToProps = (store: IStoreState): IProtectPageProps => {
  return {
    userDetails: getUserDetails(store) || {}
  }
}
export const ProtectedPage = withRouter(
  connect<IProtectPageProps, {}>(mapStateToProps)(ProtectedPageComponent)
)
