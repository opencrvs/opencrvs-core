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
import styled from 'styled-components'
import * as React from 'react'

const CheckBoxWrapper = styled.div`
  position: relative;
  width: 46px;
  height: 24px;
  border-radius: 100px;
  :focus-within {
    box-shadow: 0px 0px 0px 2px ${({ theme }) => theme.colors.yellow};
  }
`
const CheckBoxLabel = styled.label<{ checked: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 46px;
  height: 24px;
  border-radius: 100px;
  background: ${({ checked, theme }) =>
    checked ? theme.colors.positive : theme.colors.grey300};
  :hover {
    background: ${({ checked, theme }) =>
      checked ? theme.colors.greenDark : theme.colors.grey400};
  }
  cursor: pointer;
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    display: block;
    border-radius: 100px;
    width: 18px;
    height: 18px;
    margin-top: 3px;
    margin-bottom: 3px;
    margin-left: ${({ checked }) => (checked ? '24px' : '4px')};
    margin-right: ${({ checked }) => (checked ? '4px' : '24px')};
    background: ${({ theme }) => theme.colors.white};
    transition: margin-left 0.2s;
  }
`
const CheckBox = styled.input`
  opacity: 0;
  cursor: pointer;
`

export function Toggle(props: React.HTMLAttributes<HTMLInputElement>) {
  const { defaultChecked } = props
  return (
    <CheckBoxWrapper>
      <CheckBoxLabel checked={!!defaultChecked}>
        <CheckBox type="checkbox" {...props} />
      </CheckBoxLabel>
    </CheckBoxWrapper>
  )
}
