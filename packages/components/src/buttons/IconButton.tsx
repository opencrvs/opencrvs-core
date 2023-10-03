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

export const IconButton = styled(Button)`
  position: relative;
  width: 42px;
  height: 42px;
  color: ${({ theme }) => theme.colors.white};
  /* background: ${({ theme }) => theme.colors.primary}; */
  /* ${({ theme }) => theme.shadows.light}; */
  justify-content: center;
  border-radius: 2px;
  ${({ theme }) => theme.fonts.bold14};

  &:hover:enabled {
    ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.white};
  }
  &:focus {
    outline: none;
  }

  &:active:enabled {
    outline: none;
    /* background: ${({ theme }) => theme.colors.primary}; */
    border: 3px solid ${({ theme }) => theme.colors.yellow};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.grey300};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.grey300};
  }
  & > svg {
    padding: 5px;
  }
`
