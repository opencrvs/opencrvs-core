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
import * as React from 'react'
import styled from 'styled-components'
import { Tick, TickLarge } from '../icons'

const Wrapper = styled.li`
  width: 100%;
  height: 40px;
  border-radius: 4px;
  padding: 8px 8px;
  display: flex;
  align-items: center;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
`

const Label = styled.label`
  position: relative;
  cursor: pointer;
  padding-left: 12px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h4};
`

const Check = styled.span<{ size?: string }>`
  display: inline-block;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.copy};
  ${({ size }) =>
    size === 'large'
      ? `height: 40px;
    width: 40px;`
      : ` height: 24px;
    width: 24px;`}
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
        : ` height: 20.5px;
    width: 20.5px;`}
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
    border-radius: 2px;
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
  width: 100%;
  height: 40px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;

  &:active ~ ${Check} {
    &::after {
      border: 2px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme }) => theme.colors.yellow} 0 0 0 3px;
      width: ${({ size }) => `max(18px, ${(size ?? 0) - 6}px)`};
      height: ${({ size }) => `max(18px, ${(size ?? 0) - 6}px)`};
    }
  }

  &:focus ~ ${Check} {
    &::after {
      box-sizing: content-box;
      border: 2px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme }) => theme.colors.yellow} 0 0 0 3px;
      width: ${({ size }) => `max(18px, ${(size ?? 0) - 6}px)`};
      height: ${({ size }) => `max(18px, ${(size ?? 0) - 6}px)`};
    }
  }
`
type Size = 'large' | 'small'

export interface CheckboxProps extends React.OptionHTMLAttributes<{}> {
  name: string
  label: string
  value: string
  selected: boolean
  size?: Size
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const Checkbox = ({
  name,
  id,
  selected,
  label,
  value,
  onChange,
  size = 'small'
}: CheckboxProps) => {
  return (
    <Wrapper>
      <Input
        id={id}
        role="checkbox"
        size={size === 'large' ? 40 : 16}
        type="checkbox"
        checked={selected}
        name={name}
        value={value}
        onChange={onChange}
      />
      <Check size={size}>
        {selected && (size === 'large' ? <TickLarge /> : <Tick />)}
      </Check>
      <Label htmlFor={id}>{label}</Label>
    </Wrapper>
  )
}
