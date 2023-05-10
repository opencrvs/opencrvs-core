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
}

const ItemContainer = styled.li<{ isSelected?: boolean }>`
  margin-top: 2px;
  list-style-type: none;
  width: 100%;
  height: 34px;
  cursor: pointer;
  border: 0;
  outline: none;
  border-radius: 4px;
  padding: 7px 8px 0 8px;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.yellow : theme.colors.white};
  :hover {
    background-color: ${({ theme }) => theme.colors.grey100};
  }
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
      <ItemContentContainer>
        {icon && <IconContainer>{icon()}</IconContainer>}
        <LabelContainer>{label}</LabelContainer>
        <ValueContainer>{count && count !== 0 && count}</ValueContainer>
      </ItemContentContainer>
    </ItemContainer>
  )
}
