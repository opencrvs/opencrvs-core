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

import React from 'react'
import { Row } from './components/Row'
import styled from 'styled-components'

const SummaryTable = styled.table`
  border-spacing: 0 16px;
`

export interface ISummaryProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

export const Summary = ({ children, ...props }: ISummaryProps) => {
  return (
    <SummaryTable {...props}>
      <tbody>{children}</tbody>
    </SummaryTable>
  )
}

Summary.Row = Row
