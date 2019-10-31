/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
