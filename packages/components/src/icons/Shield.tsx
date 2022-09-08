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

export const Shield = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={240} height={240} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M117.51 218.684c1.585.863 3.395.863 4.98 0C136.012 211.324 200 173.661 200 120V44.477a5.735 5.735 0 00-4.344-5.563l-74.265-18.566a5.736 5.736 0 00-2.782 0L44.344 38.914A5.735 5.735 0 0040 44.477V120c0 53.661 63.988 91.324 77.51 98.684z"
      fill="url(#prefix__paint0_linear)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M107.23 80.215c0-7.166 5.81-12.975 12.978-12.975 7.169 0 12.979 5.81 12.979 12.975v9.526H107.23v-9.526zm-8.531 9.526v-9.526c0-11.879 9.631-21.507 21.509-21.507 11.879 0 21.51 9.628 21.51 21.507v9.526h7.823a5.972 5.972 0 015.972 5.972v34.517a5.972 5.972 0 01-5.972 5.972H90.875a5.972 5.972 0 01-5.972-5.972V95.713a5.972 5.972 0 015.972-5.972h7.824zm38.754 8.531H93.434v29.398h53.548V98.272h-9.529z"
      fill="url(#prefix__paint1_linear)"
    />
    <defs>
      <linearGradient
        id="prefix__paint0_linear"
        x1={120}
        y1={20}
        x2={120}
        y2={220}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6291CD" />
        <stop offset={1} stopColor="#AACAF3" />
      </linearGradient>
      <linearGradient
        id="prefix__paint1_linear"
        x1={84.487}
        y1={58.432}
        x2={165.897}
        y2={58.432}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
)
