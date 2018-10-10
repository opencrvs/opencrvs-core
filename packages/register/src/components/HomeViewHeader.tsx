import * as React from 'react'

import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '../styled-components'
import { TopMenu } from '../components/TopMenu'
import Logo from './Logo'

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  padding-bottom: 50px;
  min-height: 280px;

  /* stylelint-disable */
  + ${ActionList} {
    /* stylelint-enable */
    margin-top: -80px;
  }
`

const StyledLogo = styled(Logo)`
  margin: -40px auto auto 40px;
`

export class HomeViewHeader extends React.Component {
  render() {
    return (
      <StretchedHeader {...this.props}>
        <TopMenu hideBackButton={true} />
        <StyledLogo />
        {this.props.children}
      </StretchedHeader>
    )
  }
}
