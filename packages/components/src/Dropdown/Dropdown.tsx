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

import React, { ReactNode, useEffect, useRef } from 'react'
import { disabled } from '../Button/Button.styles'
import styled from 'styled-components'
import { DropdownProvider, useDropdown } from './DropdownContext'

const StyledWrapper = styled.nav`
  position: relative;
  height: 40px;
  display: flex;

  button {
    height: auto;
  }
`

const StyledTrigger = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    ['popovertarget'].includes(prop) || defaultValidatorFn(prop)
  // Forward popovertarget prop directly
})<{ popovertarget: string }>`
  anchor-name: --Dropdown-Anchor;
  margin: 0;
  padding: 0;
  border: 0;
  height: fit-content !important;
`

type StyledContentProp = {
  position: string
  offsetX: number
  offsetY: number
  popover: string
}
const StyledContent = styled.ul.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    ['popover'].includes(prop) || defaultValidatorFn(prop)
  // Forward popover prop directly
})<StyledContentProp>`
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.light};
  text-align: left;
  min-width: 200px;
  width: auto;
  white-space: nowrap;
  padding: 8px 0;
  position: fixed;
  position-anchor: --Dropdown-Anchor;
  inset-area: ${({ position }) => position};
  margin: 0;
  margin: ${({ offsetX, offsetY }) => `${offsetY}px ${offsetX}px`};
  list-style: none;
`

const Label = styled.li`
  ${({ theme }) => theme.fonts.reg14};
  padding: 6px 12px;
  white-space: normal;
`

const Separator = styled.div<{ weight: number }>`
  border-bottom: ${({ weight }) => `${weight}px solid `}
    ${({ theme }) => theme.colors.grey300};
  margin: 4px 0;
`

const MenuItem = styled.li<{ disabled?: boolean }>`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.grey600};
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

const DropdownWrapper: React.FC<{ children: ReactNode; id?: string }> = ({
  children,
  id
}) => {
  const { closeDropdown } = useDropdown()
  const rootRef = useRef<HTMLUListElement | null>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeDropdown])
  return (
    <StyledWrapper id={id + '-dropdownMenu'} ref={rootRef}>
      {children}
    </StyledWrapper>
  )
}

export const DropdownMenu = ({
  children,
  id
}: {
  children: ReactNode
  id?: string
}) => {
  return (
    <DropdownProvider>
      <DropdownWrapper id={id}>{children}</DropdownWrapper>
    </DropdownProvider>
  )
}

const Trigger: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return (
    <StyledTrigger popovertarget="Dropdown-Content">{children}</StyledTrigger>
  )
}
DropdownMenu.Trigger = Trigger

const Content: React.FC<{
  position?: string
  offsetX?: number
  offsetY?: number
  children: ReactNode
}> = ({
  position = 'bottom span-left',
  offsetX = 0,
  offsetY = 10,
  children
}) => {
  return (
    <StyledContent
      position={position}
      offsetX={offsetX}
      offsetY={offsetY}
      popover="true"
      id="Dropdown-Content"
    >
      {children}
    </StyledContent>
  )
}

DropdownMenu.Content = Content

DropdownMenu.Label = ({ children }: { children: string | JSX.Element }) => (
  <Label>{children}</Label>
)

const Item = ({
  onClick: onClickHandler = () => {},
  children,
  disabled = false
}: {
  onClick?: () => void
  children: ReactNode
  disabled?: boolean
}) => {
  const { addItemRef, handleKeyDown, toggleDropdown, closeDropdown } =
    useDropdown()

  const keyDownhandler = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClickHandler()
      toggleDropdown()
    } else if (e.key === 'Escape') {
      closeDropdown()
    } else handleKeyDown(e)
  }

  return (
    <MenuItem
      onClick={onClickHandler}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      ref={(item) => addItemRef(item)}
      onKeyDown={keyDownhandler}
    >
      {children}
    </MenuItem>
  )
}
DropdownMenu.Item = Item

DropdownMenu.Separator = ({ weight = 1 }: { weight?: number }) => (
  <Separator weight={weight} />
)
