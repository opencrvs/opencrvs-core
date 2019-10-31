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

export const Female = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={10} height={18} {...props}>
    <defs>
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="female_prefix__a">
        <stop stopColor="#80A4E3" offset="0%" />
        <stop stopColor="#C1D8FF" offset="100%" />
      </linearGradient>
      <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="female_prefix__b">
        <stop stopColor="#80A4E3" offset="0%" />
        <stop stopColor="#C1D8FF" offset="100%" />
      </linearGradient>
    </defs>
    <g transform="translate(-7 -3)" fillRule="nonzero" fill="none">
      <path
        d="M10.148 11h3.704a1 1 0 0 1 .967.746l2.1 8A1 1 0 0 1 15.95 21H8.05a1 1 0 0 1-.968-1.254l2.1-8a1 1 0 0 1 .967-.746z"
        fill="url(#female_prefix__a)"
      />
      <circle fill="url(#female_prefix__b)" cx={12} cy={6} r={3} />
    </g>
  </svg>
)
