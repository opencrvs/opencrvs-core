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

export const LinkButton = styled(Button)<{ textDecoration?: string }>`
  ${({ theme }) => theme.fonts.bodyStyle}
  color: ${({ theme }) => theme.colors.primary};
  height: auto;
  &:focus {
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    text-decoration-line: ${({ textDecoration }) =>
      textDecoration ? textDecoration : 'underline'};
    text-underline-offset: 4px;
    color: ${({ theme }) => theme.colors.indigoDark};
  }

  &:hover {
    text-decoration-line: ${({ textDecoration }) =>
      textDecoration ? textDecoration : 'underline'};
    text-underline-offset: 4px;
    color: ${({ theme }) => theme.colors.indigoDark};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.grey500};
    background-color: transparent;
  }
`
