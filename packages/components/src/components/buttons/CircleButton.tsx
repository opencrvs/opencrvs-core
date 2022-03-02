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

export const CircleButton = styled.button<{ dark?: boolean }>`
  color: ${({ color = '#4C68C1' }) => color};
  margin: 0;
  transition: background 0.4s ease;
  border: none;
  background: none;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  &:hover:not([disabled]) {
    ${({ theme, dark }) =>
      dark
        ? theme.colors.indigoDark
        : 'background-color: ' + theme.colors.grey300};
  }
  &:not([data-focus-visible-added]):not([disabled]):hover {
    ${({ theme, dark }) =>
      dark
        ? theme.colors.indigoDark
        : 'background-color: ' + theme.colors.grey300};
  }
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]):not([disabled]) {
    background: none;
    outline: none;
    color: ${({ color = '#4C68C1' }) => color};
  }
  &:active:not([data-focus-visible-added]):not([disabled]) {
    outline: none;
    background: ${({ theme }) => theme.colors.grey300};
    color: ${({ theme }) => theme.colors.copy};
  }
  padding: 0 8px;
  &:disabled {
    cursor: default;
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`
