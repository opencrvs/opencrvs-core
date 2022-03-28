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

export interface IToggle {
  selected?: boolean
  onChange?: () => void
}

const CheckBoxWrapper = styled.div`
  position: relative;
`
const CheckBoxLabel = styled.label<{ selected?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 44px;
  height: 24px;
  border-radius: 100px;
  background: ${({ theme }) => theme.colors.grey300};

  cursor: pointer;
  &::after {
    content: '';
    display: block;
    border-radius: 100%;
    width: 18px;
    height: 18px;
    margin-top: 3px;
    margin-bottom: 3px;
    margin-left: 4px;
    margin-right: 22px;
    background: ${({ theme }) => theme.colors.white};
    transition: margin-left 0.2s;
  }
`
const CheckBox = styled.input`
  opacity: 0;
  border-radius: 100px;
  width: 44px;
  height: 24px;
  &:checked + ${CheckBoxLabel} {
    background: ${({ theme }) => theme.colors.positive};
    &::after {
      margin-left: 22px;
      margin-right: 4px;
    }
  }
`

export function Toggle(props: IToggle) {
  return (
    <CheckBoxWrapper>
      <CheckBox
        id="checkbox"
        type="checkbox"
        checked={props.selected}
        onClick={props.onChange}
      />
      <CheckBoxLabel htmlFor="checkbox" />
    </CheckBoxWrapper>
  )
}
