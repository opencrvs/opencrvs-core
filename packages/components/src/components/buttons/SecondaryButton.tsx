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
import styled, { StyledComponentBase } from 'styled-components'
import { Button, IButtonProps } from './Button'

export const SecondaryButton = ({
  size = 'medium',
  ...props
}: IButtonProps) => {
  return <StyledButton {...props} size={size} />
}

export const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.primary};
  transition: background 0.4s ease;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  ${({ theme }) => theme.fonts.bodyBoldStyle};

  & div {
    padding-top: 2px;
  }

  &:hover {
    border: ${({ theme }) => `2px solid ${theme.colors.indigoDark}`};
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

  &:active {
    border: ${({ theme }) => `2px solid ${theme.colors.indigoDark}`};
  }

  &:disabled {
    border: ${({ theme }) => `2px solid ${theme.colors.grey300}`};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.grey300};
  }
`
