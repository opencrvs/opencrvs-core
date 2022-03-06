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

const Wrapper = styled.div`
  list-style-type: none;
  display: flex;
  flex-direction: row;
  width: auto;
  align-items: center;
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
  ${({ size, theme }) =>
    size === 'large'
      ? `
    ${theme.fonts.reg18};
    margin-left: 14px`
      : `
    ${theme.fonts.reg16};
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
  border: 2px solid
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

const Input = styled.input<{ disabled?: boolean }>`
  position: absolute;
  opacity: 0;
  z-index: 2;
  width: 40px;
  height: 40px;
  cursor: pointer;
  &:focus ~ ${Check} {
    box-shadow: ${({ theme, disabled }) =>
        disabled ? theme.colors.white : theme.colors.focus}
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

export class RadioButton extends React.Component<IRadioButton> {
  onChange = () => {
    if (this.props.onChange) {
      this.props.onChange(this.props.value)
    }
  }
  render() {
    const {
      id,
      name,
      selected,
      label,
      value,
      size,
      disabled,
      hasFlexDirection
    } = this.props
    return (
      <Wrapper>
        <CheckOuter>
          <Input
            id={id}
            disabled={disabled}
            role="radio"
            checked={value === selected}
            type="radio"
            name={name}
            value={value.toString()}
            onChange={disabled ? () => null : this.onChange}
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
}
