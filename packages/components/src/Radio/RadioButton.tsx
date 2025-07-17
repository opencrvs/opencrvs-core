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
import { Icon } from '../Icon'

const Label = styled.label<{ disabled?: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 16px;
  border-radius: 4px;
  width: 100%;
  padding: 8px 8px;
  align-items: center;
  isolation: isolate;
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.copy};
  ${({ theme }) => theme.fonts.h4};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
`

const Radio = styled.span<{
  size?: string
  disabled?: boolean
}>`
  display: inline-block;
  border-radius: 100%;
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.copy};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.copy};
  ${({ size }) =>
    size === 'large'
      ? `height: 40px;
    min-width: 40px;`
      : ` height: 24px;
    min-width: 24px;`}
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
  position: relative;
  &::after {
    position: absolute;
    content: '';
    background: ${({ theme }) => theme.colors.white};
    ${({ size }) =>
      size === 'large'
        ? `height: 37px;
    width: 37px;`
        : ` height: 21px;
    width: 21px;`}
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
    border-radius: 100%;
  }
  &:focus {
    ${({ size }) =>
      size === 'large'
        ? `height: 38px;
    width: 38px;`
        : ` height: 20px;
    width: 20px;`}
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
  margin: 0;
  height: 40px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;

  &:active ~ ${Radio} {
    &::after {
      border: 1.5px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme }) => theme.colors.yellow} 0 0 0 3px;
      width: ${({ size }) => `max(21px, ${(size ?? 0) - 6}px)`};
      height: ${({ size }) => `max(21px, ${(size ?? 0) - 6}px)`};
    }
  }

  &:checked ~ ${Radio} {
    &::after {
      width: ${({ size }) => `max(21px, ${(size ?? 0) - 3}px)`};
      height: ${({ size }) => `max(21px, ${(size ?? 0) - 3}px)`};
    }
  }

  &:focus ~ ${Radio} {
    &::after {
      box-sizing: content-box;
      border: 1.5px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme }) => theme.colors.yellow} 0 0 0 3px;
      width: ${({ size }) => `max(21px, ${(size ?? 0) - 6}px)`};
      height: ${({ size }) => `max(21px, ${(size ?? 0) - 6}px)`};
    }
  }
`

type Value = string | number | boolean

interface IRadioButton {
  id: string
  name: string
  label: string
  value: Value
  selected?: string
  disabled?: boolean
  size?: string
  'data-testid'?: string
  onChange?: (value: Value) => void
}

export const RadioButton = ({
  id,
  name,
  selected,
  label,
  value,
  size,
  disabled,
  onChange,
  ...props
}: IRadioButton) => {
  const handleChange = () => {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <Label disabled={disabled} htmlFor={id}>
      <Input
        id={id}
        size={size === 'large' ? 40 : 16}
        disabled={disabled}
        role="radio"
        checked={value === selected}
        type="radio"
        name={name}
        value={value.toString()}
        onChange={disabled ? () => null : handleChange}
        data-testid={props['data-testid']}
      />
      <Radio size={size} disabled={disabled}>
        {value === selected ? (
          size === 'large' ? (
            <Icon
              name="Circle"
              size="large"
              color="currentColor"
              weight="fill"
            />
          ) : (
            <Icon
              name="Circle"
              size="small"
              color="currentColor"
              weight="fill"
            />
          )
        ) : null}
      </Radio>
      {label}
    </Label>
  )
}
