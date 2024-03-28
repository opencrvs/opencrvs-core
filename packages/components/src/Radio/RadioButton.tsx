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

const Wrapper = styled.li`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  cursor: pointer;
  list-style-type: none;
  display: flex;
  flex-direction: row;
  padding: 8px 12px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLighter};
  }
  &:active {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`

const Label = styled.label<{
  size?: string
  disabled?: boolean
  marginLeft?: number
  hasFlexDirection?: boolean
}>`
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.copy};
  cursor: pointer;
  width: 100%;
  align-self: center;
  ${({ size, theme }) =>
    size === 'large'
      ? `
    ${theme.fonts.reg19};
    margin-left: 14px`
      : `
    ${theme.fonts.reg18};
    margin-left: 16px;`}

  ${({ hasFlexDirection }) => hasFlexDirection && `margin-left: 8px;`}
`
const CheckOuter = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  position: relative;
`
const Check = styled.span<{ size?: string; disabled?: boolean }>`
  display: flex;
  justify-content: center;
  border: 1px solid
    ${({ theme, disabled }) =>
      disabled ? theme.colors.disabled : theme.colors.copy};
  ${({ size }) =>
    size === 'large'
      ? `height: 40px;
  width: 40px;`
      : `height: 24px;
  width: 24px;`}
  border-radius: 50%;
  align-items: center;
  ${({ disabled }) => (disabled ? `&:focus { box-shadow:none}` : '')}

  & > span {
    display: flex;
    ${({ size }) =>
      size === 'large'
        ? `height: 20px;
    width: 20px;`
        : ` height: 12px;
    width: 12px;`}
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    align-self: center;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
`

const Input = styled.input<{ buttonSize?: string; disabled?: boolean }>`
  position: absolute;
  opacity: 0;
  margin: 0;
  z-index: 2;
  ${({ buttonSize }) =>
    buttonSize === 'large'
      ? `height: 40px; width: 40px;`
      : `height: 24px; width: 24px;`}
  cursor: pointer;

  &:focus ~ ${Check} {
    box-shadow: ${({ theme, disabled }) =>
        disabled ? theme.colors.white : theme.colors.yellow}
      0 0 0 4px;
  }
  /* stylelint-disable */
  &:checked ~ ${Check} > span {
    /* stylelint-enable */

    background: ${({ theme }) => theme.colors.copy};
  }
  -webkit-tap-highlight-color: transparent;
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
      <CheckOuter>
        <Input
          id={id}
          buttonSize={size}
          disabled={disabled}
          role="radio"
          checked={value === selected}
          type="radio"
          name={name}
          value={value.toString()}
          onChange={disabled ? () => null : handleChange}
        />
        <Check disabled={disabled} size={size}>
          {disabled ? '' : <span />}
        </Check>
      </CheckOuter>
      <Label
        disabled={disabled}
        size={size}
        htmlFor={id}
        hasFlexDirection={hasFlexDirection}
      >
        {label}
      </Label>
    </Wrapper>
  )
}
