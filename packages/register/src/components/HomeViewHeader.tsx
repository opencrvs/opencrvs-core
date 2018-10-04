import * as React from 'react'

import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '../styled-components'
import { TopMenu } from '../components/TopMenu'
import Logo from './Logo'

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  padding-bottom: 50px;

  /* stylelint-disable */
  + ${ActionList} {
    /* stylelint-enable */
    margin-top: -50px;
  }
`

const StyledLogo = styled(Logo)`
  margin-right: auto;
  margin-top: -40px;
  margin-left: 40px;
  margin-bottom: 10px;
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
