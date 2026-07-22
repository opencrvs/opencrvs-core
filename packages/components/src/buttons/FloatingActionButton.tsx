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

interface StyledButtonProps {
  /**
   * Injected by `DropdownMenu.Trigger` (via `asChild`) so the button can act as
   * the CSS anchor the dropdown content positions itself against.
   */
  dropdownName?: string
}

const ButtonStyled = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    // `popovertarget` is a native HTML attribute that styled-components' default
    // validator does not recognise; forward it explicitly so the button can act
    // as a `DropdownMenu.Trigger` (which wires it up via the Popover API).
    ['popovertarget'].includes(prop) || defaultValidatorFn(prop)
})<StyledButtonProps>`
  height: 56px;
  width: 56px;
  border-radius: 100%;
  background: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.shadows.light};
  justify-content: center;
  outline: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  ${({ dropdownName }) =>
    dropdownName && `anchor-name: --Dropdown-Anchor-${dropdownName};`}

  &:hover:enabled {
    ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.white};
  }

  &:active:enabled {
    background: ${({ theme }) => theme.colors.primary};
    border: 3px solid ${({ theme }) => theme.colors.yellow};
    outline: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    StyledButtonProps {
  icon?: () => React.ReactNode
}

export function FloatingActionButton({ icon, ...otherProps }: IButtonProps) {
  return <ButtonStyled {...otherProps}>{icon && icon()}</ButtonStyled>
}
