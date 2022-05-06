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

export const CircleButton = styled.button<{ dark?: boolean; size?: string }>`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  transition: background 0.4s ease;
  border: none;
  background: none;
  height: ${({ size }) => (size && size === 'small' ? 20 : 40)}px;
  width: ${({ size }) => (size && size === 'small' ? 20 : 40)}px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  &:hover:not([disabled]) {
    ${({ theme, dark }) =>
      dark
        ? 'background-color: ' + theme.colors.opacity54
        : 'background-color: ' + theme.colors.grey200};
  }
  &:not([data-focus-visible-added]):not([disabled]):hover {
    ${({ theme, dark }) =>
      dark
        ? 'background-color: ' + theme.colors.opacity54
        : 'background-color: ' + theme.colors.grey200};
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
    ${({ theme, dark }) =>
      dark
        ? 'background-color: ' + theme.colors.opacity54
        : 'background-color: ' + theme.colors.grey200};
  }
  padding: 0 8px;
  &:disabled {
    cursor: default;
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`
