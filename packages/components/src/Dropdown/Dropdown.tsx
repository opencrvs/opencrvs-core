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

import React, { ReactNode } from 'react'
import { disabled } from '../Button/Button.styles'
import styled from 'styled-components'
import { DropdownProvider, useDropdown } from './DropdownContext'

const StyledWrapper = styled.nav`
  position: relative;
  height: 40px;
  display: flex;

  button {
    padding: 0;
    height: auto;
  }
`

const StyledContent = styled.ul<{
  position: string
  offset_x: number
  offset_y: number
}>`
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.light};
  text-align: left;
  min-width: 200px;
  width: auto;
  white-space: nowrap;
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  margin: ${({ offset_x, offset_y }) => `${offset_x}px ${offset_y}px`};
  list-style: none;

  ${({ position }) => {
    switch (position) {
      case 'top':
        return 'bottom: 100%; left: 50%; transform: translateX(-50%);'
      case 'top-right':
        return 'bottom: 100%; left: 0;'
      case 'top-left':
        return 'bottom: 100%; right: 0;'
      case 'bottom':
        return 'top: 100%; left: 50%; transform: translateX(-50%);'
      case 'bottom-right':
        return 'top: 100%; left: 0;'
      case 'bottom-left':
        return 'top: 100%; right: 0;'
      case 'right':
        return 'top: 50%; left: 100%; transform: translateY(-50%);'
      case 'left':
        return 'top: 50%; right: 100%; transform: translateY(-50%);'
      default:
        return ''
    }
  }}
`

const Label = styled.li`
  padding: 6px 12px;
`

const Separator = styled.div<{ weight: number }>`
  border-bottom: ${({ weight }) => `${weight}px solid `}
    ${({ theme }) => theme.colors.grey300};
  margin: 4px 0;
`

const MenuItem = styled.li<{ disabled?: boolean }>`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.grey500};
  display: flex;
  align-items: center;
  gap: 8px;
  outline: none;
  cursor: pointer;
  margin: 0 6px;
  border-radius: 4px;
  padding: 8px 12px;
  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
    color: ${({ theme }) => theme.colors.grey600};
  }
  &:focus-visible {
    background-color: ${({ theme }) => theme.colors.yellow};
  }
  ${(props) => props.disabled && disabled}
`

export type IDropdownPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'

export const DropdownMenu = ({ children }: { children: ReactNode }) => {
  return (
    <DropdownProvider>
      <StyledWrapper>{children}</StyledWrapper>
    </DropdownProvider>
  )
}

const Trigger: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { toggleDropdown } = useDropdown()
  return React.cloneElement(children, { onClick: toggleDropdown })
}
DropdownMenu.Trigger = Trigger

const Content: React.FC<{
  position: string
  offset_x: number
  offset_y: number
  children: ReactNode
}> = ({ position, offset_x, offset_y, children }) => {
  const { isOpen } = useDropdown()

  return (
    isOpen && (
      <StyledContent
        position={position}
        offset_x={offset_x}
        offset_y={offset_y}
      >
        {children}
      </StyledContent>
    )
  )
}

DropdownMenu.Content = Content

DropdownMenu.Label = ({ children }: { children: string }) => (
  <Label>{children}</Label>
)

DropdownMenu.Item = ({
  onClick,
  children,
  disabled = false
}: {
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}) => (
  <MenuItem onClick={onClick} disabled={disabled}>
    {children}
  </MenuItem>
)

DropdownMenu.Separator = ({ weight = 1 }: { weight?: number }) => (
  <Separator weight={weight} />
)
