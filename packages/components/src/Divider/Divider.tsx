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

export interface DividerProps {
  width?: string
  border?: string
  color?: string
}

export const Divider = styled.div<DividerProps>`
  margin-bottom: 24px;
  padding: 8px 0px;
  border-bottom: ${({ border }) => border || '1px'} solid
    ${({ color, theme }) => color || theme.colors.grey200};
  width: ${({ width }) => width || '100%'};
`

export const DividerVertical = styled.div`
  background: ${({ theme }) => theme.colors.grey200};
  width: 1px;
  height: 100%;
  min-height: 24px;
`
