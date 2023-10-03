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
import { Text } from '../Text'

export interface IListConfigRowProps {
  id?: string
  labelHeader?: React.ReactNode
  valueHeader?: React.ReactNode
  rows: Array<{
    id?: string
    label: React.ReactNode
    labelDescription?: React.ReactNode
    value?: React.ReactNode
    actions: JSX.Element[]
  }>
}

export const ConfigHeader = styled.table`
  border-collapse: collapse;
  width: 100%;
  th {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey400};
    ${({ theme }) => theme.fonts.bold12};
    padding: 12px 8px;
    text-align: left;
  }
  th:first-child {
    width: 300px;
  }
  th:nth-child(2) {
    max-width: 600px;
  }

  th:last-child {
    min-width: 180px;
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

export const ConfigRow = styled.table`
  border-collapse: collapse;
  width: 100%;

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    padding: 20px 8px;
    vertical-align: center;
  }
  td:first-child {
    ${({ theme }) => theme.fonts.bold16};
    min-width: 400px;
    max-width: 540px;
  }
  td p {
    margin-top: 4px;
  }
  td:nth-child(2) {
    ${({ theme }) => theme.fonts.reg16};
    width: 100%;
    margin-left: auto;
    text-align: right;
  }

  td:last-child {
    min-width: 40px;
    padding: 8px 8px;
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
      padding-top: 16px;
      text-align: left;
    }

    td:last-child {
      vertical-align: top;
      min-width: 100px;
      width: 48px;
    }
  }
`

const ActionsContainer = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`

export function ListConfig({
  labelHeader,
  valueHeader,
  rows
}: IListConfigRowProps) {
  const hideHeader = labelHeader !== undefined || valueHeader !== undefined
  return (
    <React.Fragment>
      {hideHeader && (
        <ConfigHeader>
          <thead>
            <tr>
              <th>{labelHeader}</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
        </ConfigHeader>
      )}
      {rows.map((row, index) => (
        <ConfigRow key={index}>
          <tbody>
            <tr>
              {row.label && (
                <td>
                  {row.label}
                  {row.labelDescription && (
                    <Text variant="reg14" element="p" color="supportingCopy">
                      {row.labelDescription}
                    </Text>
                  )}
                </td>
              )}
              {row.value && <td>{row.value}</td>}
              {row.actions ? (
                <td>
                  <ActionsContainer>{row.actions}</ActionsContainer>
                </td>
              ) : (
                <td></td>
              )}
            </tr>
          </tbody>
        </ConfigRow>
      ))}
    </React.Fragment>
  )
}
