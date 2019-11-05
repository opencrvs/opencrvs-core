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
import styled from 'styled-components'
export interface IGrid {
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  columns: number
  gutter: number
  mobileGutter: number
  minWidth: number
  margin: number
}

export const grid: IGrid = {
  breakpoints: {
    xs: 0,
    sm: 359,
    md: 599,
    lg: 1023,
    xl: 1279
  },
  columns: 12,
  gutter: 12,
  mobileGutter: 8,
  minWidth: 320,
  margin: 20
}

export const FlexGrid = styled.div`
  display: flex;
  flex-flow: row nowrap;
`
