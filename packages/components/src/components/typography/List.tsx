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
import * as React from 'react'
import styled from 'styled-components'

const StyledList = styled.ul`
  width: 100%;
  ${({ theme }) => theme.fonts.reg16};
`

const StyledListItem = styled.li`
  margin-top: 10px;
  margin-bottom: 10px;
`

export interface IListProps {
  id?: string
  list: string[]
}

export const List = ({ list, id }: IListProps) => {
  return (
    <StyledList id={id}>
      {list.map((item: string, index: number) => (
        <StyledListItem key={index}>{item}</StyledListItem>
      ))}
    </StyledList>
  )
}
