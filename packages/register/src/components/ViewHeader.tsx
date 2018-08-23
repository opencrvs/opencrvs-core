import * as React from 'react'

import { Header } from '@opencrvs/components/lib/interface'
import { ActionList } from '@opencrvs/components/lib/buttons'
import styled from '../styled-components'
import { TopMenu } from '../components/TopMenu'
import { ViewHeading, IViewHeadingProps } from '../components/ViewHeading'

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  padding-bottom: 50px;
  + ${ActionList} {
    margin-top: -50px;
  }
`

export class ViewHeader extends React.Component<IViewHeadingProps> {
  render() {
    const { title, description, breadcrumb, ...otherProps } = this.props

    return (
      <StretchedHeader {...otherProps}>
        <TopMenu />
        <ViewHeading {...{ title, description, breadcrumb }} />
        {this.props.children}
      </StretchedHeader>
    )
  }
}
