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
  extends React.LiHTMLAttributes<HTMLLIElement> {
  icon?: () => React.ReactNode
  label: string
  count?: number
  isSelected?: boolean
  expandableIcon?: () => React.ReactNode
  children?: React.ReactNode
}

const ItemContainer = styled.li<{ isSelected?: boolean }>`
  list-style-type: none;
  width: 100%;
  min-height: 40px;
  cursor: pointer;
  border: 0;
  outline: none;
  border-radius: 4px;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.yellow : theme.colors.white};
  :hover {
    background-color: ${({ theme }) => theme.colors.grey100};
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 3px ${({ theme }) => theme.colors.yellow};
  }
`
const ItemContentContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 8px 16px 8px 14px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey500};
`
const LabelContainer = styled.span<{
  isSelected?: boolean
}>`
  ${({ theme }) => theme.fonts.bold14};
  margin-left: 13px;
  margin-right: 4px;
  text-align: left;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey500};
`

const ValueContainer = styled.span<{ isSelected?: boolean }>`
  margin-left: auto;
  ${({ theme }) => theme.fonts.bold12};
  padding-top: 3px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey500};
`

const IconContainer = styled.div`
  width: 24px;
`

export const NavigationItem = ({
  icon,
  label,
  count,
  isSelected,
  expandableIcon,
  children,
  ...otherProps
}: INavigationItemProps) => {
  return (
    <ItemContainer
      isSelected={isSelected}
      {...otherProps}
      tabIndex={0}
      onKeyDown={(e) => {
        const target = e.target as HTMLLIElement
        if (e.code == 'Enter' || e.code == 'Space') target.click()
      }}
    >
      <ItemContentContainer isSelected={isSelected}>
        {icon && <IconContainer>{icon()}</IconContainer>}
        <LabelContainer isSelected={isSelected}>{label}</LabelContainer>
        <ValueContainer isSelected={isSelected}>
          {count && count !== 0 ? count : expandableIcon && expandableIcon()}
        </ValueContainer>
      </ItemContentContainer>
      {isSelected && children}
    </ItemContainer>
  )
}
