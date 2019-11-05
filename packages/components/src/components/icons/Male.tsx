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

export const Male = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={10} height={18} {...props}>
    <defs>
      <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="male_prefix__a">
        <stop stopColor="#80A4E3" offset="0%" />
        <stop stopColor="#C1D8FF" offset="100%" />
      </linearGradient>
      <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="male_prefix__b">
        <stop stopColor="#80A4E3" offset="0%" />
        <stop stopColor="#C1D8FF" offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g fillRule="nonzero">
        <path
          d="M3.148 8h3.704a1 1 0 0 1 .967.746l2.1 8A1 1 0 0 1 8.95 18H1.05a1 1 0 0 1-.968-1.254l2.1-8A1 1 0 0 1 3.147 8z"
          fill="url(#male_prefix__a)"
          transform="matrix(1 0 0 -1 0 26)"
        />
        <circle fill="url(#male_prefix__b)" cx={5} cy={3} r={3} />
      </g>
    </g>
  </svg>
)
