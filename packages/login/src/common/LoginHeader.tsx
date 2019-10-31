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
import { Header } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import { Logo } from '@opencrvs/components/lib/icons'

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  min-height: 280px;
`

const StyledLogo = styled(Logo)`
  margin: 23px auto auto 5%;
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
