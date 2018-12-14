import * as React from 'react'
import { Header } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import { Logo } from '@opencrvs/components/lib/icons'

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  min-height: 280px;
`

const StyledLogo = styled(Logo)`
  margin: 12px auto auto 5%;
`

export class LoginHeader extends React.Component {
  render() {
    return (
      <StretchedHeader {...this.props}>
        <StyledLogo />
      </StretchedHeader>
    )
  }
}
