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

export const ApplicationIcon = (props: React.HTMLAttributes<SVGElement>) => {
  let fill: string
  let corner: string

  switch (props.color) {
    case 'green':
      fill = 'lightgreen'
      corner = 'green'
      break
    case 'orange':
      fill = '#F8D8B0'
      corner = '#F1B162'
      break
    default:
      fill = '#BFA4DB'
      corner = '#8049B7'
  }
  return (
    <svg width={20} height={28} fill="none" {...props}>
      <path
        d="M0 5a1 1 0 0 1 1-1h9.804L18 11.209V27a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5z"
        fill={fill}
      />
      <g filter="url(#prefix__filter0_d)">
        <path d="M10.8 4l7.2 7.2h-7.2V4z" fill={corner} />
      </g>
      <defs>
        <filter
          id="prefix__filter0_d"
          x={4.8}
          y={0}
          width={19.2}
          height={19.2}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={3} />
          <feColorMatrix values="0 0 0 0 0.207843 0 0 0 0 0.263216 0 0 0 0 0.364706 0 0 0 0.32 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}
