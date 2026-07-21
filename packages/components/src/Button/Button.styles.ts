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

import { css } from 'styled-components'

export const base = ({ fullWidth }: { fullWidth?: boolean }) => css`
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
  gap: 8px;
  text-decoration: none;

  ${fullWidth &&
  css`
    width: 100%;
  `}

  svg {
    vertical-align: top;
    pointer-events: none;
  }

  &:focus-visible {
    background: ${({ theme }) => theme.colors['feedback/focus']};
    color: ${({ theme }) => theme.colors['text/primary']};
  }
`

export const primary = ({ loading }: { loading?: boolean }) => css`
  color: ${({ theme }) => theme.colors['text/onAction']};
  background: ${({ theme }) => theme.colors['action/primary']};

  svg {
    color: ${({ theme }) => theme.colors['text/onAction']};
  }

  &:hover {
    background: ${({ theme }) => theme.colors['action/primaryHover']};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors['action/primaryPressed']};
  }

  ${loading &&
  css`
    background: ${({ theme }) => theme.colors['action/primaryHover']};
  `}
`

export const secondary = css`
  border: 1.5px solid ${({ theme }) => theme.colors['action/primary']};
  color: ${({ theme }) => theme.colors['text/primary']};
  background: ${({ theme }) => theme.colors['surface/default']};

  svg {
    color: ${({ theme }) => theme.colors['action/primary']};
  }

  &:hover {
    border: 1.5px solid ${({ theme }) => theme.colors['action/primaryHover']};
    background: ${({ theme }) => theme.colors['action/secondary']};
  }
  &:active {
    background: ${({ theme }) => theme.colors['action/secondaryHover']};
  }

  &:focus-visible {
    border: 1.5px solid ${({ theme }) => theme.colors['border/emphasis']};
    background: ${({ theme }) => theme.colors['feedback/focus']};
    color: ${({ theme }) => theme.colors['text/primary']};
  }
`
export const secondaryNegative = css`
  border: 1.5px solid ${({ theme }) => theme.colors['action/negative']};
  color: ${({ theme }) => theme.colors['text/primary']};

  svg {
    color: ${({ theme }) => theme.colors['action/negative']};
  }

  &:hover {
    background: ${({ theme }) => theme.colors['action/secondary']};
    border: 1.5px solid ${({ theme }) => theme.colors['action/negativePressed']};
  }

  &:active {
    background: ${({ theme }) => theme.colors['action/secondaryHover']};
  }

  &:focus-visible {
    border: 1.5px solid ${({ theme }) => theme.colors['action/negativePressed']};
    background: ${({ theme }) => theme.colors['feedback/focus']};
    color: ${({ theme }) => theme.colors['action/negativePressed']};
  }
`

export const tertiary = css`
  color: ${({ theme }) => theme.colors['text/primary']};

  svg {
    color: ${({ theme }) => theme.colors['action/primary']};
  }

  &:hover {
    background: ${({ theme }) => theme.colors['action/secondary']};
  }

  &:active {
    background: ${({ theme }) => theme.colors['action/secondaryHover']};
  }
`

export const positive = css`
  background: ${({ theme }) => theme.colors['action/positive']};
  color: ${({ theme }) => theme.colors['text/onAction']};

  svg {
    color: ${({ theme }) => theme.colors['text/onAction']};
  }

  &:hover {
    background: ${({ theme }) => theme.colors['action/positiveHover']};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors['action/positivePressed']};
  }
`

export const negative = css`
  background: ${({ theme }) => theme.colors['action/negative']};
  color: ${({ theme }) => theme.colors['text/onAction']};

  svg {
    color: ${({ theme }) => theme.colors['text/onAction']};
  }

  &:hover {
    background: ${({ theme }) => theme.colors['action/negativePressed']};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors['action/negativePressed']};
  }
`

export const icon = css`
  color: ${({ theme }) => theme.colors['action/primary']};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${({ theme }) => theme.colors['action/secondary']};
  }
  &:active {
    background: ${({ theme }) => theme.colors['action/secondaryHover']};
  }
  svg {
    margin-left: -8px;
    margin-right: -8px;
  }
`

export const iconPrimary = css`
  color: ${({ theme }) => theme.colors['text/onAction']};
  background: ${({ theme }) => theme.colors['action/primary']};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${({ theme }) => theme.colors['action/primaryHover']};
  }
  &:active {
    background: ${({ theme }) => theme.colors['action/primaryPressed']};
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

  ${loading &&
  css`
    svg {
      margin-left: -1px;
      margin-right: 6px;
    }
  `}
`

export const medium = css`
  ${({ theme }) => theme.fonts.bold16};
  height: 40px;
  padding: 0 12px;
`

export const large = css`
  ${({ theme }) => theme.fonts.reg18};
  height: 54px;
  padding: 0 16px;
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
