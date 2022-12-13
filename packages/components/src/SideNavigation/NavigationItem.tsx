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
  height: 36px;
  cursor: pointer;
  border: 0;
  outline: none;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.copy : theme.colors.grey500};
  svg {
    stroke-width: 2.5px;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:hover:focus {
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:focus-visible {
    ${({ theme }) => theme.fonts.bold14};
    background-color: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.grey600};
    svg {
      stroke-width: 2.5px;
    }
  }
`
const ItemContentContainer = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 0px 4px;
`
const LabelContainer = styled.span<{
  isSubItem?: boolean
}>`
  margin-left: 6px;
  margin-right: 4px;
  text-align: left;
`

const ValueContainer = styled.span`
  margin-left: auto;
  ${({ theme }) => theme.fonts.bold12};
`

const IconContainer = styled.div`
  width: 24px;
  display: flex;
  justify-content: center;
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
        {icon && <IconContainer>{icon()}</IconContainer>}
        <LabelContainer isSubItem={isSubItem}>{label}</LabelContainer>
        <ValueContainer>
          {count && count !== 0 ? count : expandableIcon && expandableIcon()}
        </ValueContainer>
      </ItemContentContainer>
      {isSelected && children}
    </ItemContainer>
  )
}
