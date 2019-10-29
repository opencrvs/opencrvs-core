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

export const Draft = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={50} height={50} {...props}>
    <title>{'B723142B-1F93-469E-8E2A-246EAB3BED54'}</title>
    <defs>
      <rect id="prefix__b" x={0} y={0} width={50} height={50} rx={2.2} />
      <filter
        x="-39%"
        y="-39%"
        width="178%"
        height="178%"
        filterUnits="objectBoundingBox"
        id="prefix__a"
      >
        <feOffset in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation={6.5}
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.147927989 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g transform="translate(0 0)" fill="none" fillRule="evenodd">
      <use fill="#000" filter="url(#prefix__a)" xlinkHref="#prefix__b" />
      <use fill="#5E93ED" xlinkHref="#prefix__b" />
      <g fill="#5E93ED" fillRule="nonzero">
        <path d="M17 27h8v11h-8z" />
        <path d="M16 26h18v13H16z" />
      </g>
      <rect
        x={1}
        y={1}
        width={22}
        height={30}
        rx={1}
        transform="translate(13 9)"
        fillRule="nonzero"
        stroke="#FFF"
        strokeWidth={2}
      />
      <rect
        fill="#FFF"
        fillRule="nonzero"
        x={18}
        y={16}
        width={14}
        height={2}
        rx={1}
      />
      <rect
        fill="#FFF"
        fillRule="nonzero"
        x={18}
        y={20}
        width={14}
        height={2}
        rx={1}
      />
      <rect
        fill="#FFF"
        fillRule="nonzero"
        x={18}
        y={24}
        width={14}
        height={2}
        rx={1}
      />
      <rect
        fill="#FFF"
        fillRule="nonzero"
        x={18}
        y={28}
        width={7}
        height={2}
        rx={1}
      />
    </g>
  </svg>
)
