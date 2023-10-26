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
import { Button } from './Button'

export const PrimaryButton = styled(Button)`
  padding: 0 8px;
  transition: background 0.4s ease;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  ${({ theme }) => theme.fonts.bold16};

  &:hover:enabled {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:focus {
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }

  &:not([data-focus-visible-added]) {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }

  &:active:enabled {
    background: ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.white};
  }

  &:not([data-focus-visible-added]):disabled {
    background: ${({ theme }) => theme.colors.grey300};
    color: ${({ theme }) => theme.colors.white};
    path {
      stroke: ${({ theme }) => theme.colors.white};
    }
  }
`
