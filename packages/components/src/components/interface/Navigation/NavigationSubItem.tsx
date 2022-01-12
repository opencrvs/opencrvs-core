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

export interface INavigationSubItemProps {
  label: string
  isSelected?: boolean
}

export const SubItemContainer = styled.a<{ isSelected?: boolean }>`
  display: block;
  border: 0;
  background-color: ${({ theme }) => theme.colors.white};
  :hover {
    background-color: ${({ theme }) => theme.colors.greyHover};
  }
  cursor: pointer;
  padding: 9px 38px 9px 46px;
  width: 100%;
  height: 38px;
  text-align: left;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey : theme.colors.greyLight};
  ${({ theme }) => theme.fonts.chartLegendStyle};
`

export const NavigationSubItem = (props: INavigationSubItemProps) => {
  return (
    <SubItemContainer isSelected={props.isSelected}>
      {props.label}
    </SubItemContainer>
  )
}
