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
import { noop } from 'lodash'

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
const MenuItem = styled.li`
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
`

export interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}

interface IProps {
  id: string
  menuHeader?: JSX.Element
  toggleButton: JSX.Element
  menuItems: IToggleMenuItem[]
  hide?: boolean
}

export const ToggleMenu = ({
  id,
  menuHeader,
  toggleButton,
  menuItems,
  hide
}: IProps) => {
  const [showSubmenu, setShowSubmenu] = useState(false)

  const closeMenuRef = useRef(() => {
    setShowSubmenu(false)
  })

  const closeMenuOnEscapeRef = useRef((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenuRef.current()
    }
  })

  useEffect(() => {
    const closeMenu = closeMenuRef.current
    const closeMenuOnEscape = closeMenuOnEscapeRef.current
    if (showSubmenu) {
      //https://github.com/facebook/react/issues/24657#issuecomment-1150119055
      setTimeout(() => document.addEventListener('click', closeMenu), 0)
      setTimeout(() => document.addEventListener('keyup', closeMenuOnEscape), 0)
    }

    return () => {
      document.removeEventListener('click', closeMenu)
      document.removeEventListener('keyup', closeMenuOnEscape)
    }
  }, [showSubmenu])

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
          type="icon"
          size="large"
          id={`${id}ToggleButton`}
          onClick={toggleMenu}
        >
          {toggleButton}
        </Button>
        {showSubmenu && (
          <MenuContainer id={`${id}SubMenu`}>
            {menuHeader && <MenuHeader>{menuHeader}</MenuHeader>}
            {menuItems.map((mi: IToggleMenuItem, index) => (
              <MenuItem
                id={`${id}Item${index}`}
                key={`${id}-${index}`}
                onClick={mi.handler}
                onKeyUp={(e) =>
                  e.key === 'Enter' || e.key === ' ' ? mi.handler() : noop
                }
                tabIndex={0}
                role="button"
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
