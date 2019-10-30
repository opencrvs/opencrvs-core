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

export const LinkButton = styled(Button)`
  ${({ theme }) => theme.fonts.bodyStyle}
  color: ${({ theme }) => theme.colors.tertiary};
  padding: 0;
  height: auto;
  text-decoration-line: underline;
  & div {
    padding: 0;
  }

  &:active {
    outline: 0;
    opacity: 1.0 !important;
    background-color: ${({ theme }) => theme.colors.focus};
  }

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    background-color: transparent;
  }
`
