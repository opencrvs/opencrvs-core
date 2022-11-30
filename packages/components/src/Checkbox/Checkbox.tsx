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
import * as React from 'react'
import styled from 'styled-components'
import { Tick, TickLarge } from '../icons'
import { Text } from '../Text'

const Wrapper = styled.li`
  padding-bottom: 10px;
  padding-top: 10px;
  list-style-type: none;
  display: flex;
  align-items: center;
`

const Label = styled.label`
  position: relative;
  cursor: pointer;
  padding-left: 15px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
`

const Check = styled.span<{ size?: string }>`
  display: inline-block;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.copy};
  ${({ size }) =>
    size === 'large'
      ? `height: 40px;
    width: 40px;`
      : ` height: 20px;
    width: 20px;`}
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
  position: relative;
  color: ${({ theme }) => theme.colors.copy};
  &::after {
    position: absolute;
    content: '';
    background: ${({ theme }) => theme.colors.white};
    ${({ size }) =>
      size === 'large'
        ? `height: 36px;
    width: 36px;`
        : ` height: 16px;
    width: 17px;`}
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
  &:focus {
    ${({ size }) =>
      size === 'large'
        ? `height: 34px;
    width: 34px;`
        : ` height: 14px;
    width: 14px;`}
  }

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
`

const Input = styled.input`
  position: absolute;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  opacity: 0;
  z-index: 2;
  cursor: pointer;

  &:active ~ ${Check} {
    &::after {
      border-radius: 4px;
      border: 4px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme, disabled }) => theme.colors.yellow} 0 0 0 3px;
    }
  }

  &:focus ~ ${Check} {
    &::after {
      box-sizing: content-box;
      border-radius: 4px;
      border: 4px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme, disabled }) => theme.colors.yellow} 0 0 0 3px;
    }
  }
  &:hover ~ ${Check} {
    &::after {
      box-sizing: content-box;
      border: 4px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme, disabled }) => theme.colors.grey300} 0 0 0 8px;
      border-radius: 4px;
    }
  }
`
type Size = 'large' | 'small'

interface ICheckbox extends React.OptionHTMLAttributes<{}> {
  name: string
  label: string
  hint?: string
  value: string
  selected: boolean
  size?: Size
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export class Checkbox extends React.Component<ICheckbox> {
  render() {
    const {
      name,
      id,
      selected,
      label,
      hint,
      value,
      onChange,
      size = 'small'
    } = this.props
    return (
      <>
        {hint && (
          <Text variant={'reg16'} element={'p'} color={'grey500'}>
            {hint}
          </Text>
        )}

        <Wrapper>
          <Input
            id={id}
            role="checkbox"
            checked={selected}
            type="checkbox"
            name={name}
            value={value}
            onChange={onChange}
            size={size === 'large' ? 40 : 16}
          />
          <Check size={size}>
            {selected && (size === 'large' ? <TickLarge /> : <Tick />)}
          </Check>
          <Label htmlFor={id}>{label}</Label>
        </Wrapper>
      </>
    )
  }
}
