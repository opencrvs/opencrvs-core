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
import * as styles from '../List.styles'
import { useListContext } from '../ListContext'

const HeaderRow = styled.tr`
  ${styles.headerRow}
`

const HeaderCell = styled.th`
  ${styles.headerCell}
`

export interface IListHeaderProps {
  id?: string
  /** Names the label column. */
  label?: React.ReactNode
  /** Names the first value column. */
  value?: React.ReactNode
  /** Names the second value column. */
  value2?: React.ReactNode
}

/**
 * Column names for the rows beneath, on the same grid so headers and values
 * line up. Hidden when the list stacks — a stacked row carries its own label.
 */
export const Header = ({ id, label, value, value2 }: IListHeaderProps) => {
  const { columns } = useListContext()

  return (
    <HeaderRow id={id}>
      {columns.start && <HeaderCell aria-hidden />}
      <HeaderCell scope="col">{label}</HeaderCell>
      <HeaderCell scope="col">{value}</HeaderCell>
      {columns.value2 && <HeaderCell scope="col">{value2}</HeaderCell>}
      {columns.actions && <HeaderCell aria-hidden />}
    </HeaderRow>
  )
}
