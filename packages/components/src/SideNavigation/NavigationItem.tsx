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
import { lightColors } from '../semantics'
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
  background-color: ${({ isSelected }) =>
    isSelected
      ? lightColors['surface/inset']
      : lightColors['surface/default']};
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ isSelected }) =>
    isSelected ? lightColors['text/primary'] : lightColors['text/tertiary']};

  &:hover {
    background: ${lightColors['surface/hover']};
    color: ${lightColors['text/primary']};
  }

  &:active {
    background-color: ${lightColors['surface/inset']};
    color: ${lightColors['text/primary']};
  }
  &:focus-visible {
    ${({ theme }) => theme.fonts.bold14};
    background-color: ${lightColors['feedback/focus']};
    color: ${lightColors['text/primary']};
    svg {
      color: ${lightColors['text/primary']};
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
  text-align: left;
  width: 100%;
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
