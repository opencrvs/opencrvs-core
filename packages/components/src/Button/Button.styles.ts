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

import { css } from 'styled-components'

export const base = css`
  ${({ theme }) => theme.fonts.bold16};

  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 0;
  outline: none;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  height: 40px;
  padding: 0 12px;
  transition: all 100ms ease-out;
  opacity: 1;
  margin: 0;
  background: transparent;

  svg {
    height: 24px;
    width: 24px;
    vertical-align: top;
    margin-left: -2px;
    margin-right: 8px;
    pointer-events: none;
  }

  &:focus-visible {
    box-shadow: 0px 0px 0px 3px ${({ theme }) => theme.colors.yellow};
  }
`

export const primary = ({ loading }: { loading?: boolean }) => css`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.primaryDarker};
  }

  ${loading &&
  css`
    background: ${({ theme }) => theme.colors.primaryDark};
  `}
`

export const secondary = css`
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    border: 2px solid ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
  &:active {
    color: ${({ theme }) => theme.colors.primaryDarker};
  }
`

export const tertiary = css`
  ${({ theme }) => theme.fonts.bold14};

  height: 32px;
  padding: 0 8px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
`

export const positive = css`
  background: ${({ theme }) => theme.colors.positive};
  color: ${({ theme }) => theme.colors.white};

  &:hover {
    background: ${({ theme }) => theme.colors.positiveDark};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.positiveDarker};
  }
`

export const negative = css`
  background: ${({ theme }) => theme.colors.negative};
  color: ${({ theme }) => theme.colors.white};

  &:hover {
    background: ${({ theme }) => theme.colors.negativeDark};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.negativeDarker};
  }
`

export const icon = css`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
  svg {
    margin-left: -8px;
    margin-right: -8px;
  }
`

export const small = ({ loading }: { loading?: boolean }) => css`
  ${({ theme }) => theme.fonts.bold14};

  height: 32px;
  padding: 8px;

  svg {
    height: 20px;
    width: 20px;
    margin-right: 6px;
    margin-left: -1px;
  }

  ${loading &&
  css`
    svg {
      margin-left: -1px;
      margin-right: 6px;
    }
  `}
`

export const medium = css`
  height: 40px;
  padding: 0 12px;

  svg {
    height: 24px;
    width: 24px;
  }
`

export const large = css`
  height: 48px;
  padding: 0 16px;

  svg {
    height: 24px;
    width: 24px;
  }
`

export const loading = css`
  opacity: 0.8;
  pointer-events: none;
  user-select: none;

  svg {
    margin-left: -2px;
    margin-right: 8px;
  }
`

export const disabled = css`
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
`
