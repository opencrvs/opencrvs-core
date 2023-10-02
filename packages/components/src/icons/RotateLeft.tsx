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

export const RotateLeft = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <g clipPath="url(#clip0)">
      <rect width="24" height="24" fill="white" />
      <path
        d="M4.97538 3.70034L5.45613 9.36961L11.1254 8.88886"
        stroke="#4C68C1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.9129 8.72305C8.00084 5.23801 12.4401 3.84032 16.2015 5.61373C20.2078 7.50257 21.9281 12.2735 20.0439 16.2699C18.1597 20.2662 13.3846 21.9747 9.37832 20.0859C7.08752 19.0059 5.54414 16.9835 4.99468 14.7024"
        stroke="#4C68C1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export default RotateLeft
