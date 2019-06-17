import * as React from 'react'
import {
  IViewHeadingProps,
  ViewHeading
} from '@performance/components/ViewHeading'
import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '@performance/styledComponents'
import { TopMenu } from '@performance/components/TopMenu'
import { Logo, Offline, Online } from '@opencrvs/components/lib/icons'

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
  margin: -71px auto auto 17px;
`

const StyledOnline = styled.div`
  position: absolute;
  top: 32px;
  right: 234px;
`

const StyledOffline = styled.div`
  position: absolute;
  top: 32px;
  right: 234px;
`

export class HomeViewHeader extends React.Component<IViewHeadingProps> {
  render() {
    const { title, description, id } = this.props
    return (
      <StretchedHeader {...this.props}>
        {navigator.onLine ? (
          <StyledOnline>
            <Online />
          </StyledOnline>
        ) : (
          <StyledOffline>
            <Offline />
          </StyledOffline>
        )}
        <TopMenu hideBackButton={true} />
        <StyledLogo />
        <ViewHeading {...{ title, description, id }} />
        {this.props.children}
      </StretchedHeader>
    )
  }
}
