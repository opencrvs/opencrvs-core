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
import { Expandable } from './../../icons/Expandable'
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
  cursor: pointer;
  padding: 0px 0px;
  border: 0;
  outline: none;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.greyHover : theme.colors.white};
  :hover {
    background-color: ${({ theme }) => theme.colors.greyHover};
  }
  :focus {
    border: 2px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.focus};
  }
`

const ItemContentContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-flow: row;
  padding: 10px 19px 10px 22px;
`
const IconContainer = styled.span`
  padding: 2px 0px;
  width: 12px;
  margin-top: 2px;
`
const LabelContainer = styled.span<{
  isSelected?: boolean
  isSubItem?: boolean
}>`
  ${({ theme }) => theme.fonts.subtitleStyle};
  margin-left: 13px;
  padding-top: 3px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey : theme.colors.greyLight};
`
const ValueContainer = styled.span<{ isSelected?: boolean }>`
  margin-left: auto;
  ${({ theme }) => theme.fonts.captionBolder};
  padding-top: 3px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey : theme.colors.greyLight};
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
        <IconContainer>{icon && icon()}</IconContainer>
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
