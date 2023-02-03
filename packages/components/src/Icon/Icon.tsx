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
import { colors } from '../colors'
import * as icons from './all-icons'

enum IconSize {
  small = 16,
  medium = 20,
  large = 24
}

type IconColor = keyof typeof colors | 'currentColor'

export type IconProps = {
  name: keyof typeof icons
  size?: keyof typeof IconSize
  color?: IconColor
  fill?: IconColor | 'none'
}

export function Icon({
  name,
  size = 'medium',
  color = 'currentColor',
  fill = 'none',
  ...rest
}: IconProps) {
  const IconComponent = icons['' + name]
  return (
    <IconComponent
      color={color === 'currentColor' ? 'currentColor' : colors[color]}
      size={IconSize[size]}
      weight={'bold'}
      {...rest}
    />
  )
}

// ChevronRight = CaretRight
// ChevronDown = CaretDown
// Search = MagnifyingGlass
// MessageCircle = ChatCircle
// LogOut = SignOut
