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
import styled from 'styled-components'
import { Button } from './Button'

export const LinkButton = styled(Button)<{
  isBoldLink?: boolean
}>`
  ${({ theme, isBoldLink }) =>
    isBoldLink ? theme.fonts.bold16 : theme.fonts.reg16}
  color: ${({ theme }) => theme.colors.tertiary};
  padding: 0;
  margin-left: -8px;
  border-radius: 2px;
  &:focus {
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    padding: 0;
    color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    color: ${({ theme }) => theme.colors.indigoDark};
    text-decoration-line: underline;
    text-underline-offset: 4px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.indigoDark};
    text-decoration-line: underline;
    text-underline-offset: 4px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.grey300};
    background-color: transparent;
  }
`
