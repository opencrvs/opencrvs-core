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
import { Row } from './RowView'
import { Stack } from '../Stack'
import { Text } from '../Text'

const Grid = styled.div<{ headingCount: number }>`
  display: grid;
  grid-template-columns: ${({ headingCount }) =>
    `repeat(${headingCount}, 1fr)`};
  grid-auto-rows: minmax(50px, auto);
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.colors.grey200};
  > div {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    grid-template-columns: auto;
    > div:not(:nth-last-child(-n + 1)) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
    }
  }
`
const HideOnSmallScreen = styled(Stack)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

export interface IComparisonListProps {
  id: string | number
  children: React.ReactNode
  headings: React.ReactNode[] | string[]
}

export const ComparisonListView = ({
  id,
  children,
  headings,
  ...props
}: IComparisonListProps) => {
  return (
    <>
      <Grid id={String(id)} {...props} headingCount={headings.length + 1}>
        {[
          <HideOnSmallScreen></HideOnSmallScreen>,
          ...headings.map((heading, index) => (
            <HideOnSmallScreen>
              <Text
                variant="reg16"
                element="span"
                color={index ? 'grey600' : 'negative'}
              >
                {heading}
              </Text>
            </HideOnSmallScreen>
          ))
        ]}
        {children}
      </Grid>
    </>
  )
}

ComparisonListView.Row = Row
