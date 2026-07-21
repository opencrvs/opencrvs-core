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
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'

const Wrapper = styled.li`
  padding-top: 5px;
  padding-bottom: 5px;
  list-style-type: none;
`

const Label = styled.label`
  position: relative;
  left: 6px;
  top: -2px;
  color: ${lightColors['text/primary']};
  ${({ theme }) => theme.fonts.reg16};
  cursor: pointer;
`

const Check = styled.span`
  display: inline-block;
  background: ${lightColors['action/primary']};
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
    background: ${lightColors['surface/default']};
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
    background: ${lightColors['surface/default']};
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
    background: ${lightColors['action/primary']};
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

export const Radio = (props: IRadio) => {
  const { id, name, selected, label, value, onChange } = props
  const handleChange = () => {
    onChange(value)
  }
  return (
    <Wrapper>
      <Input
        {...props}
        checked={value === selected}
        type="radio"
        name={name}
        value={value.toString()}
        onChange={handleChange}
      />
      <Check />
      <Label htmlFor={id}>{label}</Label>
    </Wrapper>
  )
}
