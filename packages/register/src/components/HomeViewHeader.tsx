import * as React from 'react'
import {
  IViewHeadingProps,
  ViewHeading
} from '@register/components/ViewHeading'
import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '@register/styledComponents'
import { TopMenu } from '@register/components/TopMenu'
import { Logo } from '@opencrvs/components/lib/icons'
import ConnectivityStatus from '@register/components/ConnectivityStatus'
import { BodyContent } from '@opencrvs/components/lib/layout'

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
        <BodyContent>
          <ConnectivityStatus />
          <TopMenu hideBackButton={true} />
          <StyledLogo />
          <ViewHeading {...{ title, description, id }} />
          {this.props.children}
        </BodyContent>
      </HeaderWrapper>
    )
  }
}
