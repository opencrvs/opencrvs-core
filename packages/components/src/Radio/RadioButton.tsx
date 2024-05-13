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

const Wrapper = styled.li`
  list-style-type: none;
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  width: 100%;
  padding: 8px 8px;
  align-items: flex-start;

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
  }
  &:active {
    background: ${({ theme }) => theme.colors.grey200};
  }
`

const Label = styled.label<{
  size?: string
  disabled?: boolean
  hasFlexDirection?: boolean
}>`
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.copy};
  cursor: pointer;
  align-self: center;
  padding-left: 12px;
  ${({ theme }) => theme.fonts.h4};
  ${({ hasFlexDirection }) => hasFlexDirection && `margin-left: 8px;`}
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
    width: 40px;`
      : ` height: 24px;
    width: 24px;`}
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

  &:active ~ ${Radio} {
    &::after {
      border: 2px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme }) => theme.colors.yellow} 0 0 0 3px;
      width: ${({ size }) => `max(20.5px, ${(size ?? 0) - 6}px)`};
      height: ${({ size }) => `max(20.5px, ${(size ?? 0) - 6}px)`};
    }
  }

  &:focus ~ ${Radio} {
    &::after {
      box-sizing: content-box;
      border: 2px solid ${({ theme }) => theme.colors.grey600};
      box-shadow: ${({ theme }) => theme.colors.yellow} 0 0 0 3px;
      width: ${({ size }) => `max(20.5px, ${(size ?? 0) - 6}px)`};
      height: ${({ size }) => `max(20.5px, ${(size ?? 0) - 6}px)`};
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
  hasFlexDirection?: boolean

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
  hasFlexDirection
}: IRadioButton) => {
  const handleChange = () => {
    if (onChange) {
      onChange(value)
    }
  }
  return (
    <Wrapper>
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
      />
      <Radio size={size} disabled={disabled}>
        {selected ? (
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
      <Label disabled={disabled} htmlFor={id}>
        {label}
      </Label>
    </Wrapper>
  )
}
