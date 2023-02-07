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
    background-color: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.grey600};
  }

  &:active {
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
  flex-direction: row;
  align-items: center;
  padding-right: 8px;
`
const LabelContainer = styled.span`
  margin-left: 6px;
  margin-right: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ValueContainer = styled.span`
  margin-left: auto;
  ${({ theme }) => theme.fonts.bold12};
`

const ExpandContainer = styled.span`
  display: flex;
  width: 12px;
  justify-content: center;
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
  children,
  ...otherProps
}: INavigationItemProps) => {
  return (
    <ItemContainer isSelected={isSelected} {...otherProps}>
      <ItemContentContainer>
        <ExpandContainer>{expandableIcon && expandableIcon()}</ExpandContainer>
        <IconContainer>{icon && icon()}</IconContainer>
        <LabelContainer>{label}</LabelContainer>
        <ValueContainer>{count && count !== 0 ? count : null}</ValueContainer>
      </ItemContentContainer>
      {isSelected && children}
    </ItemContainer>
  )
}
