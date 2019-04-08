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
interface IProtectPageProps {
  userDetails: IUserDetails
}
interface IProtectPageState {
  secured: boolean
}
class ProtectedPageComponent extends React.Component<
  RouteComponentProps<{}> & IProtectPageProps,
  IProtectPageState
> {
  constructor(props: RouteComponentProps<{}> & IProtectPageProps) {
    super(props)
    this.state = {
      secured: true
    }
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.markAsSecured = this.markAsSecured.bind(this)
  }
  async componentDidMount() {
    if (await storage.getItem(SCREEN_LOCK)) {
      this.setState({ secured: false })
    }
  }

  async handleVisibilityChange(isVisible: boolean) {
    if (
      this.props.userDetails.role === 'FIELD_AGENT' &&
      !isVisible &&
      !(await storage.getItem(SCREEN_LOCK))
    ) {
      this.setState({
        secured: false
      })
      storage.setItem(SCREEN_LOCK, 'true')
    }
  }
  markAsSecured() {
    this.setState({ secured: true })
    storage.removeItem(SCREEN_LOCK)
  }

  render() {
    const { secured } = this.state
    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        {(secured && this.props.children) ||
          (!secured && <SecureAccount onComplete={this.markAsSecured} />)}
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
