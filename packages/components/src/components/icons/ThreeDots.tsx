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

export const ThreeDots = (
  props: React.HTMLAttributes<SVGElement> & { expanded?: boolean }
) => {
  const { expanded, ...otherProps } = props
  return (
    <svg width={18} height={4} {...otherProps}>
      <title>
        {'DE5AAF36-C3B3-4FCC-A86F-7BC8626A2110-611-000003C1AF3BA489'}
      </title>
      <g fill="#58727E" fillRule="nonzero">
        <circle cx={2} cy={2} r={2} />
        <circle opacity={0.8} cx={9} cy={2} r={2} />
        <circle opacity={0.5} cx={16} cy={2} r={2} />
      </g>
    </svg>
  )
}
