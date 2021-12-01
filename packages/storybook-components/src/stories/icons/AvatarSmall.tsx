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

export const AvatarSmall = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={40} height={40} fill="none" {...props}>
    <circle cx={20} cy={20} r={20} fill="#35495D" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.05 9.922c3.377 0 6.139 2.762 6.139 6.138 0 3.478-2.762 6.24-6.138 6.24a6.2 6.2 0 0 1-6.24-6.24c0-3.376 2.762-6.138 6.24-6.138zM15.345 23.734h9.31c4.194 0 6.547 3.376 6.547 7.264-6.138 6.24-16.266 6.24-22.302 0 0-3.888 2.25-7.264 6.445-7.264z"
      fill="#D0D3D5"
    />
  </svg>
)
