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
export interface INavigationGroupHeaderProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  icon?: () => React.ReactNode
  label: string
  count?: number
  isSelected?: boolean
  isSubItem?: boolean
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
  margin-bottom: 2px;
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
  padding: 11px 16px 11px 10px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey500};
`
const LabelContainer = styled.span<{
  isSelected?: boolean
  isSubItem?: boolean
}>`
  ${({ theme }) => theme.fonts.bold12};
  margin-left: 0px;
  margin-right: 4px;
  text-align: left;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey400};
`

const IconContainer = styled.div`
  width: 18px;
`
// const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
//   switch (e.code) {
//     case 'Enter':
//       e.click()
//   }
// }

export const NavigationGroupHeader = ({
  icon,
  label,
  count,
  isSelected,
  isSubItem,
  children,
  ...otherProps
}: INavigationGroupHeaderProps) => {
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
        <LabelContainer isSelected={isSelected} isSubItem={isSubItem}>
          {label}
        </LabelContainer>
      </ItemContentContainer>
      {isSelected && children}
    </ItemContainer>
  )
}
