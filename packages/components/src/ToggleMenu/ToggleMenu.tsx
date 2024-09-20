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
import styled from 'styled-components'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { disabled } from '../Button/Button.styles'

const ToggleMenuContainer = styled.nav`
  position: relative;
  height: 40px;
  display: flex;
  button {
    padding: 0;
    height: auto;
  }
`
const MenuContainer = styled.ul`
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.light};
  text-align: left;
  min-width: 200px;
  width: auto;
  white-space: nowrap;
  position: absolute;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  top: 100%;
  right: 0;
  padding: 8px 0;
  margin: 0;
  list-style: none;
`

const MenuHeader = styled.li`
  padding: 8px 16px;
  margin-bottom: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

interface MenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  disabled?: boolean
}

const MenuItem = styled.li<MenuItemProps>`
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

export interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
  isDisabled?: boolean
}

type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'positive'
  | 'negative'
  | 'secondary_negative'
  | 'icon'
  | 'iconPrimary'

interface IProps {
  id: string
  menuHeader?: JSX.Element
  toggleButton: JSX.Element
  toggleButtonType?: ButtonType
  menuItems: IToggleMenuItem[]
  hide?: boolean
}

export const ToggleMenu = ({
  id,
  menuHeader,
  toggleButton,
  toggleButtonType = 'icon',
  menuItems,
  hide
}: IProps) => {
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const closeMenuRef = useRef(() => {
    setShowSubmenu(false)
  })

  const closeMenuOnEscapeRef = useRef((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenuRef.current()
    }
  })

  const getNextIndex = (last: number) => {
    let nextIndex = (last ?? -1) + 1
    while (nextIndex < menuItems.length && menuItems[nextIndex].isDisabled) {
      nextIndex++
    }
    return nextIndex < menuItems.length ? nextIndex : last
  }

  const getPreviousIndex = (last: number) => {
    let prevIndex = (last ?? menuItems.length) - 1
    while (prevIndex >= 0 && menuItems[prevIndex].isDisabled) {
      prevIndex--
    }
    return prevIndex >= 0 ? prevIndex : last
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setFocusedIndex(getNextIndex)
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex(getPreviousIndex)
    } else if ((e.key === 'Enter' || e.key === ' ') && focusedIndex !== null) {
      menuItems[focusedIndex].handler()
      setShowSubmenu(false)
    }
  }

  useEffect(() => {
    const closeMenu = closeMenuRef.current
    const closeMenuOnEscape = closeMenuOnEscapeRef.current
    if (showSubmenu) {
      menuRef.current?.focus()
      //https://github.com/facebook/react/issues/24657#issuecomment-1150119055
      setTimeout(() => document.addEventListener('click', closeMenu), 0)
      setTimeout(() => document.addEventListener('keyup', closeMenuOnEscape), 0)
    } else {
      setFocusedIndex(null)
    }

    return () => {
      document.removeEventListener('click', closeMenu)
      document.removeEventListener('keyup', closeMenuOnEscape)
    }
  }, [showSubmenu])

  useEffect(() => {
    if (focusedIndex !== null && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  const toggleMenu = () => {
    setShowSubmenu(!showSubmenu)
  }

  if (hide) {
    return null
  }

  return (
    <>
      <ToggleMenuContainer aria-expanded={showSubmenu}>
        <Button
          type={toggleButtonType}
          size="large"
          id={`${id}ToggleButton`}
          onClick={toggleMenu}
        >
          {toggleButton}
        </Button>
        {showSubmenu && (
          <MenuContainer
            id={`${id}SubMenu`}
            ref={menuRef}
            tabIndex={0}
            onKeyUp={handleKeyUp}
          >
            {menuHeader && <MenuHeader>{menuHeader}</MenuHeader>}
            {menuItems.map((mi: IToggleMenuItem, index) => (
              <MenuItem
                id={`${id}Item${index}`}
                key={`${id}-${index}`}
                ref={(el) => (itemRefs.current[index] = el)}
                onFocus={() => setFocusedIndex(index)}
                onClick={mi.handler}
                tabIndex={mi.isDisabled ? -1 : 0}
                role="button"
                disabled={mi.isDisabled}
              >
                {mi.icon && mi.icon}
                {mi.label}
              </MenuItem>
            ))}
          </MenuContainer>
        )}
      </ToggleMenuContainer>
    </>
  )
}
