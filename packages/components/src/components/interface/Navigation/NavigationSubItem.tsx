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

export interface INavigationSubItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  isSelected?: boolean
}

export const SubItemContainer = styled.button`
  border: 0;
  background-color: ${({ theme }) => theme.colors.white};
  :hover {
    background-color: ${({ theme }) => theme.colors.grey200};
  }
  outline: none;
  cursor: pointer;
  width: 100%;
  height: 36px;
  text-align: left;
`

export const LabelContainer = styled.div<{ isSelected?: boolean }>`
  padding: 7px 38px 9px 42px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey500};
  ${({ theme }) => theme.fonts.reg14}
`

export const NavigationSubItem = ({
  label,
  isSelected,
  ...otherProps
}: INavigationSubItemProps) => {
  return (
    <SubItemContainer {...otherProps}>
      <LabelContainer isSelected={isSelected}>{label}</LabelContainer>
    </SubItemContainer>
  )
}
