/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'

export const DeclarationIcon = ({
  isArchive,
  isValidatedOnReview,
  ...props
}: React.HTMLAttributes<SVGElement> & {
  isArchive?: boolean
  isValidatedOnReview?: boolean
}) => {
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
    case 'blue':
      fill = '#99C4F7'
      corner = '#0A52AA'
      break
    default:
      fill = '#CCCCCC'
      corner = '#5B5B5B'
  }

  if (isValidatedOnReview) {
    fill = '#F5CE9E'
    corner = '#C86E00'
  }

  return (
    <svg width={24} height={24} fill="none" {...props} id={'declaration_icon'}>
      <path
        d="M3 1C3 0.447716 3.44772 0 4 0L13.804 0L21 7.20903V23C21 23.5523 20.5523 24 20 24H4C3.44772 24 3 23.5523 3 23V1Z"
        fill={fill}
      />
      <path d="M13.8 0L21 7.2H13.8V0Z" fill={corner} />
      {isArchive && (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 11.5C6 11.2239 6.22386 11 6.5 11H17.5C17.7761 11 18 11.2239 18 11.5V14C18 14.2761 17.7761 14.5 17.5 14.5H17V20.5C17 20.7761 16.7761 21 16.5 21H7.5C7.22386 21 7 20.7761 7 20.5V14.5H6.5C6.22386 14.5 6 14.2761 6 14V11.5ZM16 20V14.5H8V20H16ZM17 13.5H16.5H7.5H7V12H17V13.5ZM11 15.5C10.7239 15.5 10.5 15.7239 10.5 16C10.5 16.2761 10.7239 16.5 11 16.5H13C13.2761 16.5 13.5 16.2761 13.5 16C13.5 15.7239 13.2761 15.5 13 15.5H11Z"
          fill="#5B5B5B"
        />
      )}
      {isValidatedOnReview && (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.0791 12.0875C17.307 12.3153 17.307 12.6846 17.0791 12.9124L10.6625 19.3291C10.5531 19.4385 10.4047 19.5 10.25 19.5C10.0953 19.5 9.94692 19.4385 9.83752 19.3291L6.92085 16.4124C6.69305 16.1846 6.69305 15.8153 6.92085 15.5875C7.14866 15.3597 7.51801 15.3597 7.74581 15.5875L10.25 18.0917L16.2542 12.0875C16.482 11.8597 16.8513 11.8597 17.0791 12.0875Z"
          fill="#409977"
        />
      )}
      <defs>
        <filter
          id="filter0_d_5261_5601"
          x={9.20001}
          y={2}
          width={12.8}
          height={12.8}
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
