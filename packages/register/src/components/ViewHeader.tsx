import * as React from 'react'

import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '@register/styledComponents'
import { TopMenu } from '@register/components/TopMenu'
import { Logo } from '@opencrvs/components/lib/icons'
import {
  ViewHeading,
  IViewHeadingProps
} from '@register/components/ViewHeading'
import ConnectivityStatus from '@register/components/ConnectivityStatus'
import { BodyContent } from '@opencrvs/components/lib/layout'

const HeaderWarapper = styled(Header)`
  display: block;
  justify-content: flex-end;
  padding-bottom: 50px;

  /* stylelint-disable */
  + ${ActionList} {
    /* stylelint-enable */
    margin-top: -50px;
  }
`

export class ViewHeader extends React.Component<IViewHeadingProps> {
  render() {
    const {
      title,
      description,
      breadcrumb,
      hideBackButton,
      id,
      ...otherProps
    } = this.props

    return (
      <HeaderWarapper {...otherProps}>
        <BodyContent>
          <ConnectivityStatus />
          {hideBackButton && <Logo />}
          <TopMenu hideBackButton={hideBackButton} />
          <ViewHeading {...{ title, description, breadcrumb, id }} />
          {this.props.children}
        </BodyContent>
      </HeaderWarapper>
    )
  }
}
