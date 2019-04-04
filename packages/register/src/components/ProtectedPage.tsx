import * as React from 'react'
import styled from '../styled-components'
import PageVisibility from 'react-page-visibility'

const Block = styled.button`
  margin: 100px;
`
interface IProtectPageProps {
  children: React.ReactElement
}
interface IProtectPageState {
  insecuredPage: boolean
}
export class ProtectedPage extends React.Component<
  IProtectPageProps,
  IProtectPageState
> {
  constructor(props: IProtectPageProps) {
    super(props)
    this.state = {
      insecuredPage: false
    }
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
  }
  handleVisibilityChange(isVisible: boolean) {
    if (!isVisible) {
      this.setState({
        insecuredPage: true
      })
    }
  }
  markAsSecured() {
    this.setState({ insecuredPage: false })
  }

  render() {
    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        {(!this.state.insecuredPage && this.props.children) || (
          <Block onClick={() => this.markAsSecured()}>hi</Block>
        )}
      </PageVisibility>
    )
  }
}
