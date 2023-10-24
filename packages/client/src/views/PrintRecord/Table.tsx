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

type ITableProps = {
  heading: { label: string; colSpan: number }
  rows: {
    key?: string
    data: {
      value: React.ReactNode
      colSpan?: number
      italic?: boolean
      bold?: boolean
    }[]
  }[]
  borderedCell?: boolean
}

const StyledTable = styled.table`
  margin-top: 8px;
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  border-radius: 4px;
  border: 0.5px solid ${({ theme }) => theme.colors.grey500};
  overflow: hidden;
  table-layout: fixed;
`
const StyledTHead = styled.thead`
  background: ${({ theme }) => theme.colors.grey200};
  ${({ theme }) => theme.fonts.bold14}
`
const StyledTH = styled.th`
  text-transform: uppercase;
  text-align: left;
  padding: 4px 8px;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.grey500};
`

const StyledTR = styled.tr`
  :not(:last-child) > td {
    border-bottom: 0.5px solid ${({ theme }) => theme.colors.grey500};
  }
`
const StyledTD = styled.td<{ bold?: boolean }>`
  padding: 4px 8px;
  vertical-align: top;
  :not(:last-child) {
    border-right: 0.5px solid ${({ theme }) => theme.colors.grey500};
  }
  ${({ theme, bold }) => (bold ? theme.fonts.bold14 : theme.fonts.reg14)}
`

const BorderlessTD = styled.td<{ bold?: boolean }>`
  vertical-align: top;
  padding: 0 8px;
  ${({ theme, bold }) => (bold ? theme.fonts.bold14 : theme.fonts.reg14)}
`
const StyledEM = styled.em`
  ${({ theme }) => theme.fonts.reg14}
`

export function PrintRecordTable(props: ITableProps) {
  const { heading, rows, borderedCell = true } = props
  const Row = borderedCell ? StyledTR : 'tr'
  const DataCell = borderedCell ? StyledTD : BorderlessTD
  return (
    <StyledTable>
      <StyledTHead>
        <tr>
          <StyledTH colSpan={heading.colSpan}>{heading.label}</StyledTH>
        </tr>
      </StyledTHead>
      <tbody>
        {rows.map((row, rowIndex) => {
          const rowKey =
            row.key || `${row.data[0].value?.toString()}_${rowIndex}`
          return (
            <Row key={rowKey}>
              {row.data.map((item, colIndex) => {
                const TDContentWrapper = item.italic ? StyledEM : React.Fragment
                return (
                  <DataCell
                    key={`${rowKey}_${colIndex}`}
                    colSpan={item.colSpan}
                    bold={item.bold}
                  >
                    <TDContentWrapper>{item.value}</TDContentWrapper>
                  </DataCell>
                )
              })}
            </Row>
          )
        })}
      </tbody>
    </StyledTable>
  )
}
