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

export const DisabledArrow = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 42.7 25.9" width={42.7} height={25.9} {...props}>
    <title>Disabled arrow</title>
    <g id="Arrow-Gradient" stroke="#F4F4F4" strokeWidth={4} fill="none">
      <path fill="none" strokeLinecap="round" d="M4.6,14h30" />
      <polyline
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="30.6,6.9 37.7,14 30.6,21 	"
      />
    </g>
  </svg>
)
