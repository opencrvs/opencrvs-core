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

export const SecondaryButton = styled(Button)`
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  border-radius: 2px;
  ${({ theme }) => theme.fonts.bold16};
  height: 40px;

  & div {
    padding-top: 2px;
  }

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
    border: none;
  }

  &:not([data-focus-visible-added]) {
    outline: none;
    color: ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.white};
    border: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  }

  &:active {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
  }

  &:disabled {
    border: ${({ theme }) => `2px solid ${theme.colors.disabled}`};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
