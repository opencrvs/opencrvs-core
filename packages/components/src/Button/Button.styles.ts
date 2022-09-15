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

export const baseStyles = css`
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
`

export const primaryStyles = ({ loading }: { loading: boolean }) => css`
  color: #fff;
  background: ${({ theme }) => theme.colors.primary};

  &:hover {
    background: #42506b;
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 3px #edc55e;
  }
  &:active {
    background-color: #42506b;
    box-shadow: 0px 0px 0px 3px #93acd7;
  }

  ${loading &&
  css`
    background: ${({ theme }) => theme.colors.primaryDark};
  `}
`

export const secondaryStyles = css`
  border: 2px solid #4972bb;
  color: #4972bb;

  &:hover {
    border: 2px solid #42639c;
    color: #42639c;
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 3px #edc55e;
  }
  &:active {
    color: #42639c;
    box-shadow: 0px 0px 0px 3px #93acd7;
  }
`

export const tertiaryStyles = css`
  height: 32px;
  padding: 0 8px;
  background: #ffffff;
  color: #4972bb;
  font-size: 14px;

  &:hover {
    background: #eeeeee;
    color: #42639c;
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 3px #edc55e;
  }
  &:active {
    background: #eeeeee;
    color: #42639c;
    box-shadow: 0px 0px 0px 3px #93acd7;
  }
`

export const positiveStyles = css`
  background: #409977;
  color: #ffffff;

  &:hover {
    background: #2c6e55;
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 3px #edc55e;
  }
  &:active {
    background-color: #2c6e55;
    box-shadow: 0px 0px 0px 3px #92d4bb;
  }
`

export const negativeStyles = css`
  background: #d53f3f;
  color: #ffffff;

  &:hover {
    background: #994040;
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 3px #edc55e;
  }
  &:active {
    background-color: #994040;
    box-shadow: 0px 0px 0px 3px #e79393;
  }
`

export const globalIconStyles = css`
  background: #ffffff;
  color: #4972bb;
  border-radius: 100%;
  aspect-ratio: 1 / 1;

  &:hover {
    background: #eeeeee;
    color: #42639c;
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 3px #edc55e;
  }
  &:active {
    background: #eeeeee;
    color: #42639c;
  }
  svg {
    margin-left: -8px;
    margin-right: -8px;
  }
`

export const smallStyles = ({ loading }: { loading: boolean }) => css`
  ${({ theme }) => theme.fonts.bold14};

  height: 32px;
  padding: 0 12px;

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

export const mediumStyles = css`
  height: 40px;
  padding: 0 16px;

  svg {
    height: 24px;
    width: 24px;
  }
`

export const largeStyles = css`
  height: 48px;
  padding: 0 20px;

  svg {
    height: 24px;
    width: 24px;
  }
`

export const globalLoadingStyles = css`
  opacity: 0.8;
  pointer-events: none;
  user-select: none;

  svg {
    margin-left: -2px;
    margin-right: 8px;
  }
`

export const globalDisabledStyles = css`
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
`
