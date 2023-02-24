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
import { Icon, IconProps } from '../Icon'
import { Button } from '../Button'

export function ToggleIcon({
  name,
  size = 'medium',
  color = 'currentColor',
  fill = 'currentColor',
  ...rest
}: IconProps & React.HTMLAttributes<HTMLButtonElement>) {
  const { defaultChecked } = rest
  return (
    <>
      <Button type="icon" {...rest}>
        <Icon
          name={name}
          color={color}
          fill={defaultChecked ? fill : 'white'}
        ></Icon>
      </Button>
    </>
  )
}
