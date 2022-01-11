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
export interface INavigationItemProps {
  icon?: JSX.Element
  label: string
  onClick?: () => void
  count?: number
  isSelected?: boolean
  isExpandable?: boolean
  isSubItem?: boolean
  children?: React.ReactNode
}

const ItemContainer = styled.button<{ isSelected?: boolean }>`
  width: 100%;
  cursor: pointer;
  padding: 0px 0px;
  border: 0;
  outline: none;
  :hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.greySelected : theme.colors.greyHover};
  }
  :focus {
    border: 2px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.focus};
  }
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.greySelected : theme.colors.white};
`

const ItemContentContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-flow: row;
  padding: 10px 19px 10px 22px;
`
const IconContainer = styled.span`
  padding: 2px 0px;
  width: 12px;
`
const LabelContainer = styled.span<{
  isSelected?: boolean
  isSubItem?: boolean
}>`
  ${({ theme }) => theme.fonts.subtitleStyle};
  margin-left: 13px;
  padding-top: 3px;
  color: ${({ isSelected, theme }) => isSelected && theme.colors.grey};
`
const ValueContainer = styled.span<{ isSelected?: boolean }>`
  margin-left: auto;
  ${({ theme }) => theme.fonts.captionBolder};
  padding-top: 3px;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.grey : theme.colors.greyLight};
`

export const NavigationItem = (props: INavigationItemProps) => {
  return (
    <ItemContainer isSelected={props.isSelected}>
      <ItemContentContainer>
        <IconContainer>{props.icon && props.icon}</IconContainer>
        <LabelContainer
          isSelected={props.isSelected}
          isSubItem={props.isSubItem}
        >
          {props.label}
        </LabelContainer>
        <ValueContainer isSelected={props.isSelected}>
          {props.count ? props.count : props.isExpandable && <Expandable />}
        </ValueContainer>
      </ItemContentContainer>
      {props.isSelected && props.children}
    </ItemContainer>
  )
}
