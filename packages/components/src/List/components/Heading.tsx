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
import { useListContext, columnCount } from '../ListContext'

export type ListHeadingFontVariant =
  | 'reg12'
  | 'reg14'
  | 'reg16'
  | 'reg18'
  | 'h4'
  | 'h3'

const HeadingRow = styled.tr`
  ${styles.headingRow}
`

const HeadingCell = styled.th<{ $fontVariant: ListHeadingFontVariant }>`
  ${styles.headingCell}
  ${({ theme, $fontVariant }) => theme.fonts[$fontVariant]};
`

export interface ListHeadingProps {
  id?: string
  label: React.ReactNode
  fontVariant?: ListHeadingFontVariant
}

/**
 * Names the group of rows beneath it, within the list. Spans every column, so
 * it reads as a break in the list rather than as a row with an empty value.
 *
 * This is not `<List.Header>`: that names the columns, once, above everything.
 */
export const Heading = ({
  id,
  label,
  fontVariant = 'h4'
}: ListHeadingProps) => {
  const { columns } = useListContext()

  return (
    <HeadingRow id={id} role="row">
      <HeadingCell
        $fontVariant={fontVariant}
        colSpan={columnCount(columns)}
        role="columnheader"
        scope="colgroup"
      >
        {label}
      </HeadingCell>
    </HeadingRow>
  )
}
