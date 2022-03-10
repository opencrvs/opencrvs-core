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

export const DeclarationIcon = (props: React.HTMLAttributes<SVGElement>) => {
  let fill: string
  let corner: string

  switch (props.color) {
    case 'green':
      fill = '#A4DBC6'
      corner = '#49B78D'
      break
    case 'orange':
      fill = '#F8D8B0'
      corner = '#F1B162'
      break
    case 'red':
      fill = '#EB9284'
      corner = '#D53F3F'
      break
    case 'teal':
      fill = '#96E9E4'
      corner = '#4CC1BA'
      break
    case 'grey':
      fill = '#DEE2E4'
      corner = '#909397'
      break
    default:
      fill = '#BFA4DB'
      corner = '#8049B7'
  }
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        d="M6 5C6 4.44772 6.44772 4 7 4L13.2027 4L18 8.80602V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V5Z"
        fill={fill}
      />
      <g filter="url(#filter0_d_5261_5601)">
        <path d="M13.2 4L18 8.8H13.2V4Z" fill={fill} />
      </g>
      <defs>
        <filter
          id="filter0_d_5261_5601"
          x={9.20001}
          y={2}
          width={12.8}
          height={12.8}
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_5261_5601"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_5261_5601"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
