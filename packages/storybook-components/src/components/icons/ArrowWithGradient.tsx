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

/* TODO one line is missing */
export const ArrowWithGradient = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 42.7 25.9" width={42.7} height={25.9} {...props}>
    <g id="Arrow-Gradient">
      <linearGradient
        id="ArrowGradient"
        gradientUnits="userSpaceOnUse"
        x1="-272.8998"
        y1="25.9785"
        x2="-273.8292"
        y2="25.9785"
        gradientTransform="matrix(30 0 0 -1 8220.5381 39.957)"
      >
        <stop offset={0} style={{ stopColor: '#4C68C1' }} />
        <stop offset={1} style={{ stopColor: '#B0C8F1' }} />
      </linearGradient>
      <path
        id="Line-3"
        fill="none"
        stroke="url(#ArrowGradient)"
        strokeWidth={4}
        strokeLinecap="round"
        d="M4.6,14h30"
      />
      <linearGradient
        id="HorizontalGradient"
        gradientUnits="userSpaceOnUse"
        x1="-236.1376"
        y1="402.7931"
        x2="-234.674"
        y2="404.2532"
        gradientTransform="matrix(7.0711 7.0711 7.0711 -7.0711 -1157.5292 4531.8896)"
      >
        <stop offset={0} style={{ stopColor: '#4C68C1' }} />
        <stop offset={1} style={{ stopColor: '#B0C8F1' }} />
      </linearGradient>
      <polyline
        id="Line-6"
        fill="none"
        stroke="url(#HorizontalGradient)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        points="30.6,6.9 37.7,14 30.6,21 	"
      />
    </g>
  </svg>
)
