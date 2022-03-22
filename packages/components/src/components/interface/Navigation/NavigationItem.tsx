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
export interface INavigationItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
  label: string
  count?: number
  isSelected?: boolean
  expandableIcon?: () => React.ReactNode
  isSubItem?: boolean
  children?: React.ReactNode
}

const ItemContainer = styled.button<{ isSelected?: boolean }>`
  width: 100%;
  height: 40px;
  cursor: pointer;
  border: 0;
  outline: none;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.white : theme.colors.white};
  :hover {
    background-color: ${({ theme }) => theme.colors.grey100};
  }
`
const ItemContentContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 8px 16px 8px 14px;
`
const LabelContainer = styled.span<{
  isSelected?: boolean
  isSubItem?: boolean
}>`
  ${({ theme }) => theme.fonts.bold14};
  margin-left: 13px;
  padding-top: 3px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.copy : theme.colors.grey500};
`

const ValueContainer = styled.span<{ isSelected?: boolean }>`
  margin-left: auto;
  ${({ theme }) => theme.fonts.bold12};
  padding-top: 3px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.copy : theme.colors.grey500};
`

export const NavigationItem = ({
  icon,
  label,
  count,
  isSelected,
  expandableIcon,
  isSubItem,
  children,
  ...otherProps
}: INavigationItemProps) => {
  return (
    <ItemContainer isSelected={isSelected} {...otherProps}>
      <ItemContentContainer>
        {icon && icon()}
        <LabelContainer isSelected={isSelected} isSubItem={isSubItem}>
          {label}
        </LabelContainer>
        <ValueContainer isSelected={isSelected}>
          {count && count !== 0 ? count : expandableIcon && expandableIcon()}
        </ValueContainer>
      </ItemContentContainer>
      {isSelected && children}
    </ItemContainer>
  )
}
