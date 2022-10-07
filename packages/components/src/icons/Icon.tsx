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
import { colors } from '@opencrvs/components/lib/colors'
import { IconSize, IPropsIcon } from './utils'
import * as FeatherIcons from 'react-feather'

export function Icon(props: IPropsIcon) {
  const size = props.size ? IconSize[props.size] : IconSize.small
  const strokeColor = props.strokeColor
    ? colors[props.strokeColor]
    : 'currentColor'
  const fillColor = props.fillColor ? colors[props.fillColor] : 'none'
  const strokeWidth = props.strokeWidth ?? 2
  const FeatherIcon = FeatherIcons[props.name]
  return (
    <FeatherIcon
      size={size}
      color={strokeColor}
      strokeWidth={strokeWidth}
      fill={fillColor}
    />
  )
}
