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

export const ApplicationsOrangeAmber = (
  props: React.HTMLAttributes<SVGElement>
) => (
  <svg width={68} height={87} fill="none" {...props}>
    <g filter="url(#prefix__filter0_d)">
      <path
        d="M6 5a1 1 0 0 1 1-1h32.612L62 26.528V78a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5z"
        fill="#F1B162"
      />
      <g filter="url(#prefix__filter1_d)">
        <path d="M39.6 4L62 26.5H39.6V4z" fill="#F8D8B0" />
      </g>
    </g>
    <defs>
      <filter
        id="prefix__filter0_d"
        x={0}
        y={0}
        width={68}
        height={87}
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
      <filter
        id="prefix__filter1_d"
        x={35.6}
        y={1}
        width={30.4}
        height={30.5}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feColorMatrix values="0 0 0 0 0.207843 0 0 0 0 0.263216 0 0 0 0 0.364706 0 0 0 0.24 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
)
