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
import styled from 'styled-components'
import { Text } from '../Text'

export interface ListReviewProps {
  id?: string
  labelHeader?: React.ReactNode
  valueHeader?: React.ReactNode
  rows: Array<{
    id?: string
    label: React.ReactNode
    value?: React.ReactNode
    actions: JSX.Element[]
  }>
}

export const ReviewHeader = styled.table`
  border-collapse: collapse;
  width: 100%;
  th {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey400};
    ${({ theme }) => theme.fonts.bold12};
    padding: 12px 0;
    text-align: left;
  }
  th:first-child {
    min-width: 280px;
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
  /* Media query for mobile */
  @media screen and (max-width: 768px) {
    thead {
      display: none;
    }
  }
`

export const ReviewRow = styled.table`
  border-collapse: collapse;
  width: 100%;

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }

  td {
    padding: 12px 0;
    vertical-align: top;
  }

  td:first-child {
    ${({ theme }) => theme.fonts.bold16};
    min-width: 280px;
    padding-right: 48px;
  }
  td:nth-child(2) {
    ${({ theme }) => theme.fonts.reg16};
    width: 100%;
    padding-right: 48px;
  }

  td:last-child {
    min-width: 80px;
    text-align: right;
  }

  /* Media query for mobile */
  @media screen and (max-width: 768px) {
    td:first-child {
      display: block;
      min-width: 200px;
      width: 100%;
      border-bottom: none;
      padding-bottom: 0;
    }
    td:nth-child(2) {
      display: block;
      width: 100%;
      padding-top: 8px;
    }
    td:last-child {
      vertical-align: top;
      min-width: 100px;
    }
  }
`

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`

export function ListReview({
  rows,
  labelHeader,
  valueHeader
}: ListReviewProps): JSX.Element {
  const hideHeader = labelHeader !== undefined || valueHeader !== undefined
  return (
    <React.Fragment>
      {hideHeader && (
        <ReviewHeader>
          <thead>
            <tr>
              <th>{labelHeader}</th>
              <th>{valueHeader}</th>
              <th></th>
            </tr>
          </thead>
        </ReviewHeader>
      )}
      {rows.map((row, index) => (
        <ReviewRow key={index}>
          <tbody>
            <tr>
              {row.label && <td>{row.label}</td>}
              {row.value && Array.isArray(row.value) && (
                <td>
                  {row.value.map((value: string, index: number) => (
                    <div key={index}>{value}</div>
                  ))}
                </td>
              )}
              {row.actions ? (
                <td>
                  <ActionsContainer>{row.actions}</ActionsContainer>
                </td>
              ) : (
                row.actions && <td></td>
              )}
            </tr>
          </tbody>
        </ReviewRow>
      ))}
    </React.Fragment>
  )
}
