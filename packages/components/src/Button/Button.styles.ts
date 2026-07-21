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
import { lightColors } from '../semantics'

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
    background: ${lightColors['feedback/focus']};
    color: ${lightColors['text/primary']};
  }
`

export const primary = ({ loading }: { loading?: boolean }) => css`
  color: ${lightColors['text/onAction']};
  background: ${lightColors['action/primary']};

  svg {
    color: ${lightColors['text/onAction']};
  }

  &:hover {
    background: ${lightColors['action/primaryHover']};
  }
  &:active {
    background-color: ${lightColors['action/primaryPressed']};
  }

  ${loading &&
  css`
    background: ${lightColors['action/primaryHover']};
  `}
`

export const secondary = css`
  border: 1.5px solid ${lightColors['action/primary']};
  color: ${lightColors['text/primary']};
  background: ${lightColors['surface/default']};

  svg {
    color: ${lightColors['action/primary']};
  }

  &:hover {
    border: 1.5px solid ${lightColors['action/primaryHover']};
    background: ${lightColors['action/secondary']};
  }
  &:active {
    background: ${lightColors['action/secondaryHover']};
  }

  &:focus-visible {
    border: 1.5px solid ${lightColors['border/emphasis']};
    background: ${lightColors['feedback/focus']};
    color: ${lightColors['text/primary']};
  }
`
export const secondaryNegative = css`
  border: 1.5px solid ${lightColors['action/negative']};
  color: ${lightColors['text/primary']};

  svg {
    color: ${lightColors['action/negative']};
  }

  &:hover {
    background: ${lightColors['action/secondary']};
    border: 1.5px solid ${lightColors['action/negativePressed']};
  }

  &:active {
    background: ${lightColors['action/secondaryHover']};
  }

  &:focus-visible {
    border: 1.5px solid ${lightColors['action/negativePressed']};
    background: ${lightColors['feedback/focus']};
    color: ${lightColors['action/negativePressed']};
  }
`

export const tertiary = css`
  color: ${lightColors['text/primary']};

  svg {
    color: ${lightColors['action/primary']};
  }

  &:hover {
    background: ${lightColors['action/secondary']};
  }

  &:active {
    background: ${lightColors['action/secondaryHover']};
  }
`

export const positive = css`
  background: ${lightColors['action/positive']};
  color: ${lightColors['text/onAction']};

  svg {
    color: ${lightColors['text/onAction']};
  }

  &:hover {
    background: ${lightColors['action/positiveHover']};
  }
  &:active {
    background-color: ${lightColors['action/positivePressed']};
  }
`

export const negative = css`
  background: ${lightColors['action/negative']};
  color: ${lightColors['text/onAction']};

  svg {
    color: ${lightColors['text/onAction']};
  }

  &:hover {
    background: ${lightColors['action/negativePressed']};
  }
  &:active {
    background-color: ${lightColors['action/negativePressed']};
  }
`

export const icon = css`
  color: ${lightColors['action/primary']};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${lightColors['action/secondary']};
  }
  &:active {
    background: ${lightColors['action/secondaryHover']};
  }
  svg {
    margin-left: -8px;
    margin-right: -8px;
  }
`

export const iconPrimary = css`
  color: ${lightColors['text/onAction']};
  background: ${lightColors['action/primary']};
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: ${lightColors['action/primaryHover']};
  }
  &:active {
    background: ${lightColors['action/primaryPressed']};
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
