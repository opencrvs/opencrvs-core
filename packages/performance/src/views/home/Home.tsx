import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'src/styled-components'
import { Header } from '@opencrvs/components/lib/interface'
import Logo from 'src/components/Logo'

const messages = defineMessages({
  hello: {
    id: 'performance.hello',
    defaultMessage: 'Hello',
    description: 'Test'
  }
})

const StyledHeader = styled(Header)`
  padding: 0 26px;
  box-shadow: none;
`

class HomeView extends React.Component<InjectedIntlProps> {
  render() {
    const { intl } = this.props
    return (
      <>
        <StyledHeader>
          <Logo />
        </StyledHeader>
        <div>{intl.formatMessage(messages.hello)}</div>
      </>
    )
  }
}

export const Home = connect(null, null)(injectIntl(HomeView))
