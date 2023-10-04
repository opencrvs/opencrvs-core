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
import { colors } from '../colors'

export const KeyboardArrowDown = ({
  pathStroke,
  ...otherProps
}: React.HTMLAttributes<SVGElement> & { pathStroke?: keyof typeof colors }) => {
  return (
    <svg width={24} height={24} fill="none" {...otherProps}>
      <path
        d="M6 9l6 5.96L18 9"
        stroke={pathStroke ? colors[pathStroke] : 'currentColor'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
