/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import styled from 'styled-components'

export enum ColumnContentAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

export enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

export const NoResultText = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold16}
  text-align: left;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: fixed;
    left: 0;
    right: 0;
    top: 50%;
    text-align: center;
  }
`
