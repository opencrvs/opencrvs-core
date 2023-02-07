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

export interface INavigationGroupTitleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  isSelected?: boolean
  expandableIcon?: () => React.ReactNode
  children?: React.ReactNode
}

const ItemContainer = styled.button<{ isSelected?: boolean }>`
  height: 24px;
  margin: 4px 0px;
  cursor: pointer;
  border: 0;
  outline: none;
  padding: 2px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bold12};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.copy : theme.colors.grey500};
  svg {
    stroke-width: 2.5px;
  }
  &:hover {
    color: ${({ theme }) => theme.colors.grey600};
  }

  &:active {
    color: ${({ theme }) => theme.colors.grey600};
  }

  &:focus-visible {
    ${({ theme }) => theme.fonts.bold12};
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
`
const LabelContainer = styled.span`
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 3px;
`

const ValueContainer = styled.span`
  display: flex;
  align-items: center;
`

export const NavigationGroupTitle = ({
  label,
  isSelected,
  expandableIcon,
  children,
  ...otherProps
}: INavigationGroupTitleProps) => {
  return (
    <ItemContainer isSelected={isSelected} {...otherProps}>
      <ItemContentContainer>
        <ValueContainer>{expandableIcon && expandableIcon()}</ValueContainer>
        <LabelContainer>{label}</LabelContainer>
      </ItemContentContainer>
      {isSelected && children}
    </ItemContainer>
  )
}
