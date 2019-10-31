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

export const AddUser = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={54} height={54} fill="none" {...props}>
    <g filter="url(#prefix__filter0_d)">
      <rect x={7} y={5} width={40} height={40} rx={2} fill="#fff" />
      <rect
        x={7}
        y={5}
        width={40}
        height={40}
        rx={2}
        stroke="#4C68C1"
        strokeWidth={2}
      />
    </g>
    <path
      d="M31 34v-2a4 4 0 0 0-4-4h-7a4 4 0 0 0-4 4v2"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23.5 24a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M35 21v6M38 24h-6"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g filter="url(#prefix__filter1_d)">
      <rect x={8} y={5} width={40} height={40} rx={2.211} fill="#4C68C1" />
    </g>
    <path
      d="M32 34v-2a4 4 0 0 0-4-4h-7a4 4 0 0 0-4 4v2"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24.5 24a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36 21v6M39 24h-6"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <filter
        id="prefix__filter0_d"
        x={0}
        y={0}
        width={54}
        height={54}
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
        x={2}
        y={1}
        width={52}
        height={52}
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
