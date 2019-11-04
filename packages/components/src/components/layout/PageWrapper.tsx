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
import styled from 'styled-components'
import { Content } from './Content'

const Page = styled.div`
  display: flex;
  min-width: ${({ theme }) => theme.grid.minWidth}px;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  ${({ theme }) => theme.fonts.bodyStyle};
`

const Wrapper = styled.div`
  margin: auto;
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
`

export class PageWrapper extends React.Component {
  render() {
    const { children } = this.props
    return (
      <Page>
        <Wrapper>
          <Content>{children}</Content>
        </Wrapper>
      </Page>
    )
  }
}
