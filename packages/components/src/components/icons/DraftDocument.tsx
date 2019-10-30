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

export const DraftDocument = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={44} height={58} {...props}>
    <title>4E7A58AB-FCA4-4C68-AA85-3FF75FB29296</title>
    <defs>
      <linearGradient x1="50%" y1="95.936%" x2="50%" y2="3%" id="a">
        <stop stopColor="#4C68C1" offset="0%" />
        <stop stopColor="#B0C8F1" offset="100%" />
      </linearGradient>
      <linearGradient x1="3.532%" y1="49.468%" x2="96.468%" y2="49.468%" id="b">
        <stop stopColor="#4C68C1" offset="0%" />
        <stop stopColor="#B0C8F1" offset="100%" />
      </linearGradient>
    </defs>
    <g fillRule="nonzero" strokeWidth={2} fill="none">
      <rect
        stroke="url(#a)"
        fill="#FFF"
        x={1}
        y={5}
        width={38}
        height={52}
        rx={1}
      />
      <g transform="translate(4)">
        <rect
          stroke="url(#a)"
          fill="#FFF"
          x={1}
          y={1}
          width={38}
          height={52}
          rx={1}
        />
        <path
          d="M7.5 13.5H32M7.5 22.5H32M7.5 27.5H9M12.5 27.5H14M17.5 27.5H19M7.5 9.5H13M7.5 18.5H13"
          stroke="url(#b)"
          strokeLinecap="round"
        />
      </g>
    </g>
  </svg>
)
