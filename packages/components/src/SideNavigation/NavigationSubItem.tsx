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
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'

export interface INavigationSubItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  isSelected?: boolean
}

export const SubItemContainer = styled.button<{ isSelected?: boolean }>`
  border: 0;
  background-color: ${lightColors['surface/default']};
  outline: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  min-height: 32px;
  color: ${({ isSelected }) =>
    isSelected ? lightColors['text/primary'] : lightColors['text/tertiary']};
  ${({ isSelected, theme }) =>
    isSelected ? theme.fonts.bold14 : theme.fonts.reg14};
  &:hover {
    color: ${lightColors['text/primary']};
    ${({ theme }) => theme.fonts.bold14};
  }

  &:active {
    color: ${lightColors['text/primary']};
    ${({ theme }) => theme.fonts.bold14};
  }

  &:focus-visible {
    ${({ theme }) => theme.fonts.bold14};
    background-color: ${lightColors['feedback/focus']};
    color: ${lightColors['text/primary']};
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
