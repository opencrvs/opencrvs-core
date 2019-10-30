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

export const Camera = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={76}
    height={76}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="13 13 50 50"
    {...props}
  >
    <title>{`DF5D8046-FBAD-431B-A177-989ADF5BC0C9`}</title>
    <defs>
      <rect id="camera_b" x={0} y={0} width={50} height={50} rx={2.2} />
      <filter
        x="-39%"
        y="-39%"
        width="178%"
        height="178%"
        filterUnits="objectBoundingBox"
        id="camera_a"
      >
        <feOffset in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation={6.5}
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.272588315 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(13 13)">
        <use fill="#000" filter="url(#camera_a)" xlinkHref="#camera_b" />
        <use fill="#5E93ED" xlinkHref="#camera_b" />
      </g>
      <path
        d="M25.595 25.638c-.77-.006-.78.497-1.075.863h-.97c-1.395 0-2.55 1.141-2.55 2.535v18.716c0 1.394 1.155 2.536 2.55 2.536h28.9c1.395 0 2.55-1.142 2.55-2.536V29.036c0-1.394-1.155-2.535-2.55-2.535H28.53c-.275-.442-.305-.869-1.155-.863h-1.78zM23.55 28.2h28.9c.49 0 .85.361.85.836v18.716c0 .475-.36.837-.85.837h-28.9c-.49 0-.85-.362-.85-.837V29.036c0-.475.36-.836.85-.836zm24.995 1.686c-.445.02-.83.444-.81.889.02.445.445.83.89.81h2.125c.45.006.863-.4.863-.85 0-.45-.414-.856-.863-.85h-2.205zM38 31.585c4 0 7.225 3.223 7.225 7.22A7.21 7.21 0 0 1 38 46.028a7.21 7.21 0 0 1-7.225-7.221A7.21 7.21 0 0 1 38 31.585zm0 1.699c-3.041 0-5.525 2.482-5.525 5.522s2.484 5.522 5.525 5.522c3.041 0 5.525-2.483 5.525-5.522 0-3.04-2.484-5.522-5.525-5.522zm0 1.699a3.811 3.811 0 0 1 3.825 3.823A3.811 3.811 0 0 1 38 42.629a3.811 3.811 0 0 1-3.825-3.823A3.811 3.811 0 0 1 38 34.983zm0 1.699a2.124 2.124 0 1 0-.001 4.249A2.124 2.124 0 0 0 38 36.68z"
        fill="#FFF"
        fillRule="nonzero"
      />
    </g>
  </svg>
)
