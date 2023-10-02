/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
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
  margin-top: 2px;
  width: 100%;
  height: 34px;
  cursor: pointer;
  border: 0;
  outline: none;
  border-radius: 4px;
  padding: 0 8px;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.grey200 : theme.colors.white};
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.copy : theme.colors.grey500};

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.grey600};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:focus-visible {
    ${({ theme }) => theme.fonts.bold14};
    background-color: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.grey600};
    svg {
      color: ${({ theme }) => theme.colors.grey600};
    }
  }
`
const ItemContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`
const LabelContainer = styled.span`
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
`

const IconContainer = styled.div`
  width: 24px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
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
        <IconContainer>{icon && icon()}</IconContainer>
        <LabelContainer>{label}</LabelContainer>
        <ValueContainer>{count && count !== 0 ? count : null}</ValueContainer>
        {expandableIcon && (
          <ExpandContainer>{expandableIcon()}</ExpandContainer>
        )}
      </ItemContentContainer>
      {children}
    </ItemContainer>
  )
}
