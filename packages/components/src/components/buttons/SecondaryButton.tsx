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
import styled from 'styled-components'
import { Button } from './Button'

export const SecondaryButton = styled(Button)`
  padding: 0 8px;
  color: ${({ theme }) => theme.colors.primary};
  transition: background 0.4s ease;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  ${({ theme }) => theme.fonts.bold16};
  height: 40px;

  & div {
    padding-top: 2px;
  }

  &:hover:enabled {
    border: ${({ theme }) => `2px solid ${theme.colors.indigoDark}`};
    color: ${({ theme }) => theme.colors.indigoDark};
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
    border: ${({ theme }) => `2px solid ${theme.colors.indigoDark}`};
    color: ${({ theme }) => theme.colors.indigoDark};
    background: ${({ theme }) => theme.colors.grey100};
  }

  &:disabled {
    border: ${({ theme }) => `2px solid ${theme.colors.grey300}`};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.grey300};
  }
`
