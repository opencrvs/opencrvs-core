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

export const PrimaryButton = styled(Button)`
  padding: 0 8px;
  transition: background 0.4s ease;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  ${({ theme }) => theme.fonts.bodyBoldStyle};

  &:hover:enabled {
    background: ${({ theme }) => theme.colors.indigoDark};
  }
  &:focus {
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }

  &:not([data-focus-visible-added]) {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }

  &:active:enabled {
    background: ${({ theme }) => theme.colors.indigoDark};
    color: ${({ theme }) => theme.colors.white};
  }

  &:not([data-focus-visible-added]):disabled {
    cursor: not-allowed;
    opacity: 0.6;
    path {
      stroke: ${({ theme }) => theme.colors.white};
    }
  }
`
