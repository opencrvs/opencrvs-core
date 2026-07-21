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
import React from 'react'
import { lightColors } from '../semantics'

type IButtonSize = 'small' | 'medium' | 'large'

const dimensionMap = {
  small: '24px',
  medium: '32px',
  large: '40px'
}

const Button = styled.button<ICircleButtonProps & { size: IButtonSize }>`
  color: ${lightColors['action/primary']};
  transition: background 0.4s ease;
  border: none;
  background: none;
  height: ${({ size }) => dimensionMap[size]};
  width: ${({ size }) => dimensionMap[size]};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  &:hover:not([disabled]) {
    ${({ dark }) =>
      dark
        ? lightColors['action/primaryHover']
        : 'background-color: ' + lightColors['action/secondaryHover']};
  }
  &:not([data-focus-visible-added]):not([disabled]):hover {
    ${({ dark }) =>
      dark
        ? lightColors['action/primaryHover']
        : 'background-color: ' + lightColors['action/secondaryHover']};
  }
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:focus {
    outline: none;
    background: ${lightColors['feedback/focus']};
    color: ${lightColors['text/primary']};
  }
  &:not([data-focus-visible-added]):not([disabled]) {
    background: none;
    outline: none;
    color: ${({ color = '#4C68C1' }) => color};
  }
  &:active:not([data-focus-visible-added]):not([disabled]) {
    outline: none;
    background: ${lightColors['action/secondaryHover']};
    color: ${lightColors['text/primary']};
  }
  &:disabled {
    cursor: default;
    path {
      stroke: ${lightColors['action/disabled']};
    }
  }
`
interface ICircleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IButtonSize
  dark?: boolean
}

export function CircleButton({
  size = 'large',
  children,
  ...props
}: ICircleButtonProps) {
  return (
    <Button size={size} {...props}>
      {children}
    </Button>
  )
}
