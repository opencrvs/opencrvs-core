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
import { Button, IButtonProps } from './Button'

export const SecondaryButton = ({
  size = 'medium',
  ...props
}: IButtonProps) => {
  return <StyledButton {...props} size={size} />
}

const StyledButton = styled(Button)`
  padding: 0 8px;
  color: ${({ theme }) => theme.colors.primary};
  transition: background 0.4s ease;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  ${({ theme }) => theme.fonts.bold16};

  &:hover:enabled {
    border: ${({ theme }) => `2px solid ${theme.colors.primaryDark}`};
    color: ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.grey100};
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
    border: none;
  }

  &:not([data-focus-visible-added]) {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.white};
    border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  }

  &:active:enabled {
    border: ${({ theme }) => `2px solid ${theme.colors.primaryDark}`};
    color: ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.grey100};
  }

  &:disabled {
    border: ${({ theme }) => `2px solid ${theme.colors.grey300}`};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.grey300};
  }
`
