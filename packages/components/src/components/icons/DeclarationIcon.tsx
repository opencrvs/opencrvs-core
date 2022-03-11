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
      corner = '#409877'
      break
    case 'orange':
      fill = '#F5CE9E'
      corner = '#C86E00'
      break
    case 'red':
      fill = '#EEA6A6'
      corner = '#9A4040'
      break
    case 'teal':
      fill = '#96E8E4'
      corner = '#03668D'
      break
    case 'grey':
      fill = '#CCCCCC'
      corner = '#5B5B5B'
      break
    case 'purple':
      fill = '#BFA4DB'
      corner = '#450487'
      break
    default:
      fill = '#CCCCCC'
      corner = '#5B5B5B'
  }

  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        d="M3 1C3 0.447716 3.44772 0 4 0L13.804 0L21 7.20903V23C21 23.5523 20.5523 24 20 24H4C3.44772 24 3 23.5523 3 23V1Z"
        fill={fill}
      />
      <path d="M13.8 0L21 7.2H13.8V0Z" fill={corner} />
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
