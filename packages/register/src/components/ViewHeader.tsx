import * as React from 'react'

import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '../styled-components'
import { TopMenu } from '../components/TopMenu'
import { Logo } from '@opencrvs/components/lib/icons'
import { ViewHeading, IViewHeadingProps } from '../components/ViewHeading'
import ConnectivityStatus from './ConnectivityStatus'
import { ShrinkedHeader } from 'src/App'

const StretchedHeader = styled(Header)`
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
      <StretchedHeader {...otherProps}>
        <ShrinkedHeader>
          <ConnectivityStatus />
          {hideBackButton && <Logo />}
          <TopMenu hideBackButton={hideBackButton} />
          <ViewHeading {...{ title, description, breadcrumb, id }} />
          {this.props.children}
        </ShrinkedHeader>
      </StretchedHeader>
    )
  }
}
