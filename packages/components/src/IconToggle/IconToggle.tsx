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
import { Icon, IconProps } from '../Icon'
import { Button } from '../Button'

const CheckBoxLabel = styled.label`
  cursor: pointer;
`
const CheckBox = styled.input`
  opacity: 0;
  display: none;
`

export function IconToggle({
  name,
  size = 'medium',
  color = 'currentColor',
  fill = 'none',
  ...rest
}: IconProps & React.HTMLAttributes<HTMLInputElement>) {
  const { defaultChecked } = rest
  return (
    <Button type="icon">
      <CheckBoxLabel htmlFor="checkboxwithicon">
        <CheckBox type="checkbox" id="checkboxwithicon" {...rest} />
        <Icon
          name={name}
          color={color}
          fill={defaultChecked ? fill : 'none'}
        ></Icon>
      </CheckBoxLabel>
    </Button>
  )
}
