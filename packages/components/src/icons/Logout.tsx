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

interface IPropsLogout {
  stroke?: string
  height?: number
  width?: number
}
/* fill={props.stroke || 'currentColor'}*/

export const Logout = (
  props: React.HTMLAttributes<SVGElement> & IPropsLogout
) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M14 22h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-5"
      stroke={props.stroke || '#fff'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 16l4-4-4-4M15 12H3"
      stroke={props.stroke || '#fff'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
