import * as React from 'react'
import { IViewHeadingProps, ViewHeading } from './ViewHeading'
import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '../styled-components'
import { TopMenu } from './TopMenu'
import { Logo } from '@opencrvs/components/lib/icons'
import ConnectivityStatus from './ConnectivityStatus'
import { HeaderContent } from '@opencrvs/components/lib/layout'

const HeaderWrapper = styled(Header)`
  display: block;
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
  margin: -71px auto auto 20px;
`

export class HomeViewHeader extends React.Component<IViewHeadingProps> {
  render() {
    const { title, description, id } = this.props
    return (
      <HeaderWrapper>
        <HeaderContent>
          <ConnectivityStatus />
          <TopMenu hideBackButton={true} />
          <StyledLogo />
          <ViewHeading {...{ title, description, id }} />
          {this.props.children}
        </HeaderContent>
      </HeaderWrapper>
    )
  }
}
