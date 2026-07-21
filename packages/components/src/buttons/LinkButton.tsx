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
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'

/** @deprecated Use Link instead */
export const LinkButton = styled(Button)<{
  isBoldLink?: boolean
}>`
  ${({ theme, isBoldLink }) =>
    isBoldLink ? theme.fonts.bold16 : theme.fonts.reg16}
  color: ${lightColors['text/disabled']};
  padding: 0;
  margin-left: -8px;
  border-radius: 2px;
  &:focus {
    background: ${lightColors['feedback/focus']};
    color: ${lightColors['text/primary']};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    padding: 0;
    color: ${lightColors['text/link']};
  }

  &:active {
    color: ${lightColors['action/primaryHover']};
    text-decoration-line: underline;
    text-underline-offset: 4px;
  }

  &:hover {
    color: ${lightColors['action/primaryHover']};
    text-decoration-line: underline;
    text-underline-offset: 4px;
  }

  &:disabled {
    color: ${lightColors['text/disabled']};
    background-color: transparent;
  }
`
