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
import { PrimaryButton } from './PrimaryButton'

export const DangerButton = styled(PrimaryButton)`
  background-color: ${({ theme }) => theme.colors.error};
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.errorHover};
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }

  &:not([data-focus-visible-added]) {
    outline: none;
    background-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.white};
  }
  &:active:enabled {
    background: ${({ theme }) => theme.colors.error};
  }
`
