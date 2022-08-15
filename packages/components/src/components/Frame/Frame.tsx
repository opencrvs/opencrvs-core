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

export interface IFrameProps {
  /** Accepts a header component that will be rendered at the top-most portion of an application frame */
  header: React.ReactNode
  /** Accepts a navigation component that will be rendered in the left sidebar of an application frame */
  navigation?: React.ReactNode
  /** The content to display inside the frame. */
  children: React.ReactNode
}

const BodyContainer = styled.div`
  margin-left: 0px;

  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 250px; /* Width of the left navigation */
    padding: 0px 24px;
  }
`

export function Frame({ header, navigation, children }: IFrameProps) {
  return (
    <>
      {header}
      {navigation}

      <BodyContainer>{children}</BodyContainer>
    </>
  )
}
