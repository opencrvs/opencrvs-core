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

interface IProps {
  id?: string
  items: string[]
}

const StyledList = styled.ul`
  width: 100%;
  padding: 24px;
  overflow: auto;
`
const StyledListItem = styled.li`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }

  ${({ theme }) => `color: ${theme.colors.copy}`};
`

const StyledText = styled.div`
  margin-left: 8px;
  ${({ theme }) => `${theme.fonts.h5Style};
    font-family: ${theme.fonts.regularFont};
    color: ${theme.colors.copy}
  `}
`

function renderListItem(text: string, index: number) {
  return (
    <StyledListItem key={index}>
      <StyledText>{text}</StyledText>
    </StyledListItem>
  )
}

export function BulletList(props: IProps) {
  return (
    <StyledList id={props.id}>{props.items.map(renderListItem)}</StyledList>
  )
}
