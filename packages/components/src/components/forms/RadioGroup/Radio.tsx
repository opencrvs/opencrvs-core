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

const Wrapper = styled.li`
  padding-top: 5px;
  padding-bottom: 5px;
  list-style-type: none;
`

const Label = styled.label`
  position: relative;
  left: 6px;
  top: -2px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
  cursor: pointer;
`

const Check = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  height: 22px;
  width: 22px;
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
  z-index: 1;

  &::after {
    display: block;
    position: relative;
    content: '';
    background: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    height: 14px;
    width: 14px;
    top: -14px;
    left: 4px;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }

  &::before {
    display: block;
    position: relative;
    content: '';
    background: ${({ theme }) => theme.colors.white};
    border-radius: 50%;
    height: 18px;
    width: 18px;
    top: 2px;
    left: 2px;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
`

const Input = styled.input`
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
  /* stylelint-disable */
  &:checked ~ ${Check}::after {
    /* stylelint-enable */
    background: ${({ theme }) => theme.colors.primary};
  }
`

type Value = string | number | boolean

interface IRadio {
  id: string
  name: string
  label: string
  value: Value
  selected: string
  onChange: (value: Value) => void
}

export class Radio extends React.Component<IRadio> {
  onChange = () => {
    this.props.onChange(this.props.value)
  }
  render() {
    const { id, name, selected, label, value, onChange } = this.props
    return (
      <Wrapper>
        <Input
          {...this.props}
          role="radio"
          checked={value === selected}
          type="radio"
          name={name}
          value={value.toString()}
          onChange={this.onChange}
        />
        <Check />
        <Label htmlFor={id}>{label}</Label>
      </Wrapper>
    )
  }
}
