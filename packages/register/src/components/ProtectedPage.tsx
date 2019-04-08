import * as React from 'react'
import PageVisibility from 'react-page-visibility'
import { SecureAccount } from 'src/views/SecureAccount/SecureAccountView'
import { storage } from 'src/storage'
const SCREEN_LOCK = 'screenLock'
interface IProtectPageProps {
  children: React.ReactElement
}
interface IProtectPageState {
  secured: boolean
}
export class ProtectedPage extends React.Component<
  IProtectPageProps,
  IProtectPageState
> {
  constructor(props: IProtectPageProps) {
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
    if (!isVisible && !(await storage.getItem(SCREEN_LOCK))) {
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
    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        {(this.state.secured && this.props.children) ||
          (!this.state.secured && (
            <SecureAccount onComplete={this.markAsSecured} />
          ))}
      </PageVisibility>
    )
  }
}
