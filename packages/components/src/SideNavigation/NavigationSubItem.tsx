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

export interface INavigationSubItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  isSelected?: boolean
}

export const SubItemContainer = styled.button<{ isSelected?: boolean }>`
  border: 0;
  background-color: ${({ theme }) => theme.colors.white};
  outline: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  min-height: 32px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey600 : theme.colors.grey500};
  ${({ isSelected, theme }) =>
    isSelected ? theme.fonts.bold14 : theme.fonts.reg14};
  &:hover {
    color: ${({ theme }) => theme.colors.grey600};
    ${({ theme }) => theme.fonts.bold14};
  }

  &:active {
    color: ${({ theme }) => theme.colors.grey600};
    ${({ theme }) => theme.fonts.bold14};
  }

  &:focus-visible {
    ${({ theme }) => theme.fonts.bold14};
    background-color: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.grey600};
  }
`

export const LabelContainer = styled.div`
  margin-left: 34px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`

export const NavigationSubItem = ({
  label,
  isSelected,
  ...otherProps
}: INavigationSubItemProps) => {
  return (
    <SubItemContainer isSelected={isSelected} {...otherProps}>
      <LabelContainer>{label}</LabelContainer>
    </SubItemContainer>
  )
}
