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
import React from 'react'
import styled from 'styled-components'
import { Row } from './components/Row'
import { Header } from './components/Header'

export interface ListReviewProps {
  id?: string
  header?: React.ReactElement<typeof Header>[]
  children: React.ReactElement<typeof Row>[]
}

const ListReviewTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  tr:last-child {
    border-bottom: none;
  }

  /* Media query for mobile */
  @media screen and (max-width: 768px) {
    thead {
      display: none;
    }
  }
`

export function ListReview({ header, children }: ListReviewProps): JSX.Element {
  const hideHeader = header !== undefined
  return (
    <ListReviewTable>
      {hideHeader && <thead>{header}</thead>}
      <tbody>{children}</tbody>
    </ListReviewTable>
  )
}

ListReview.Header = Header
ListReview.Row = Row
