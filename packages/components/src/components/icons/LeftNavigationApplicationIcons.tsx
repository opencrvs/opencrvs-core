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

export const LeftNavigationApplicationIcons = (
  props: React.HTMLAttributes<SVGElement>
) => {
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
    case 'red':
      fill = '#EB9284'
      corner = '#D53F3F'
      break
    default:
      fill = '#BFA4DB'
      corner = '#8049B7'
  }
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 3C0 2.44772 0.447715 2 1 2L7.20266 2L12 6.80602V17C12 17.5523 11.5523 18 11 18H1C0.447715 18 0 17.5523 0 17V3Z"
        fill={fill}
      />
      <g filter="url(#filter0_d_187_1979)">
        <path d="M7.20001 2L12 6.8H7.20001V2Z" fill={corner} />
      </g>
      <defs>
        <filter
          id="filter0_d_187_1979"
          x="3.20001"
          y="0"
          width="12.8"
          height="12.8"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_187_1979"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_187_1979"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
