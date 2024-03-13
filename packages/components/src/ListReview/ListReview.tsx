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

export interface ListReviewProps {
  id?: string
  labelHeader?: React.ReactNode
  valueHeader?: React.ReactNode
  children: React.ReactElement<typeof Row>[]
}

const ReviewHeader = styled.tr`
  th {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey400};
    ${({ theme }) => theme.fonts.bold12};
    padding: 12px 0;
    text-align: left;
  }

  th:first-child {
    min-width: 300px;
    padding-right: 48px;
  }

  th:nth-child(2) {
    width: 100%;
    padding-right: 48px;
  }

  th:last-child {
    min-width: 80px;
    padding: 8px 8px;
    text-align: right;
  }
`

const ListReviewTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  /* Media query for mobile */
  @media screen and (max-width: 768px) {
    thead {
      display: none;
    }
  }
`

export function ListReview({
  labelHeader,
  valueHeader,
  children
}: ListReviewProps): JSX.Element {
  const hideHeader = labelHeader !== undefined || valueHeader !== undefined
  return (
    <ListReviewTable>
      {hideHeader && (
        <thead>
          <ReviewHeader>
            <th>{labelHeader}</th>
            <th>{valueHeader}</th>
            <th></th>
          </ReviewHeader>
        </thead>
      )}
      <tbody>{children}</tbody>
    </ListReviewTable>
  )
}

ListReview.Row = Row
