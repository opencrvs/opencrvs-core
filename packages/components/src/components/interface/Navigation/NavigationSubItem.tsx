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
  cursor: pointer;
  padding: 8px 37px 8px 47px;
  width: 100%;
  height: 40px;
  text-align: left;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.indigo : theme.colors.grey};
  ${({ theme }) => theme.fonts.chartLegendStyle};
`

export const NavigationSubItem = (props: INavigationSubItemProps) => {
  return (
    <SubItemContainer isSelected={props.isSelected}>
      {props.label}
    </SubItemContainer>
  )
}
