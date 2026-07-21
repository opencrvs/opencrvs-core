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
const ButtonStyled = styled.button`
  height: 56px;
  width: 56px;
  border-radius: 100%;
  background: ${lightColors['action/primary']};
  ${({ theme }) => theme.shadows.light};
  justify-content: center;
  outline: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:hover:enabled {
    ${lightColors['action/primaryHover']};
    color: ${lightColors['text/onAction']};
  }

  &:active:enabled {
    background: ${lightColors['action/primary']};
    border: 3px solid ${lightColors['feedback/focus']};
    outline: none;
  }

  &:disabled {
    background-color: ${lightColors['action/disabled']};
    cursor: not-allowed;
    color: ${lightColors['text/disabled']};
  }
`
interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
}

export function FloatingActionButton({ icon, ...otherProps }: IButtonProps) {
  return <ButtonStyled {...otherProps}>{icon && icon()}</ButtonStyled>
}
