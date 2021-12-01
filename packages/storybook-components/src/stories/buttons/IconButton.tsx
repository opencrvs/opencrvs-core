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

export const IconButton = styled(Button)`
  position: relative;
  width: 42px;
  height: 42px;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.shadows.mistyShadow};
  justify-content: center;
  border-radius: 2px;
  ${({ theme }) => theme.fonts.buttonStyle};

  &:hover:enabled {
    ${({ theme }) => theme.gradients.gradientSkyDark};
    color: ${({ theme }) => theme.colors.white};
  }
  &:focus {
    outline: none;
  }

  &:active:enabled {
    outline: none;
    background: ${({ theme }) => theme.colors.primary};
    border: 3px solid ${({ theme }) => theme.colors.focus};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.placeholder};
  }
  & > svg {
    padding: 5px;
  }
`
