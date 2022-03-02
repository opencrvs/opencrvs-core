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

export const ApplicationIcon = ({
  isArchive,
  ...props
}: React.HTMLAttributes<SVGElement> & { isArchive?: boolean }) => {
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
    <svg width={20} height={28} fill="none" {...props}>
      <path
        d="M0 5a1 1 0 0 1 1-1h9.804L18 11.209V27a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5z"
        fill={fill}
      />
      {isArchive && (
        <path
          transform="translate(3.75,15) scale(.60)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0.75C0 0.335786 0.335786 0 0.75 0H17.25C17.6642 0 18 0.335786 18 0.75V4.5C18 4.91421 17.6642 5.25 17.25 5.25H16.5V14.25C16.5 14.6642 16.1642 15 15.75 15H2.25C1.83579 15 1.5 14.6642 1.5 14.25V5.25H0.75C0.335786 5.25 0 4.91421 0 4.5V0.75ZM15 13.5V5.25H3V13.5H15ZM16.5 3.75H15.75H2.25H1.5V1.5H16.5V3.75ZM7.5 6.75C7.08579 6.75 6.75 7.08579 6.75 7.5C6.75 7.91421 7.08579 8.25 7.5 8.25H10.5C10.9142 8.25 11.25 7.91421 11.25 7.5C11.25 7.08579 10.9142 6.75 10.5 6.75H7.5Z"
          fill="#1E2326"
        />
      )}
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
